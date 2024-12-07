function(instance, context) {
    window.Buffer = buffer.Buffer;
    const SHYFT_API_KEY = context.keys["SHYFT_API_KEY"] || "f0-srNoFP0bZvGLE";
    const RPC_URL =
        context.keys["RPC_URL"] ||
        "https://rpc.shyft.to?api_key=f0-srNoFP0bZvGLE";
    const swapRef = context.keys["SWAP_REF"] || "3r28grWHXN5iHEX3dewDBzYFAFGeHVrxycQAUM3pTzXy";

    let provider;
    let isPhantom = false;
    if (window.phantom && window.phantom.solana) {
        isPhantom = true;
    }

    let isSolflare = false;
    if (window.solflare) {
        isSolflare = true;
    }

    let isBackpack = false;
    if (window.backpack) {
        isBackpack = true;
    }

    let isOkxWallet = false;
    if (window.okxwallet && window.okxwallet.solana) {
        isOkxWallet = true;
    }

    instance.publishState("is_phantom_installed", isPhantom);
    instance.publishState("is_backpack_installed", isBackpack);
    instance.publishState("is_solflare_installed", isSolflare);
    instance.publishState("is_okx_installed", isOkxWallet);
    const getProvider = (providerId) => {
        if (providerId == 1) {
            provider = window.phantom.solana;
            if (provider && provider.isPhantom) {
                return provider;
            }
        } else if (providerId == 2) {
            provider = window.solflare;
            if (provider && provider.isSolflare) {
                return provider;
            }
        } else if (providerId == 3) {
            provider = window.backpack;
            if (provider && provider.isBackpack) {
                return provider;
            }
        } else if (providerId == 4) {
            provider = window.okxwallet.solana;
            if (provider && provider.isOkxWallet) {
                return provider;
            }
        }
        // Handle case where provider is not found
        return null;
    };

    const connectWallet = async (providerId) => {
        if (!provider || provider.providerId !== providerId) {
            provider = getProvider(providerId);
        }
        if (provider) {
            const resp = await provider.connect();
            console.log("Response", resp);
            console.log("publicKey", provider.publicKey.toString());
            instance.publishState("is_connected", true);
            // Publish the public key if needed
            instance.publishState("public_key_adr", provider.publicKey.toString());
            instance.publishState("connected_wallet", providerId.toString());
        } else {
            console.error("Provider not found");
        }
    };

    const disconnectWallet = async (providerId) => {
        if (!provider || provider.providerId !== providerId) {
            provider = getProvider(providerId);
        }
        if (provider) {
            const resp = await provider.disconnect();
            console.log("Response", resp);
            instance.publishState("public_key_adr", "");
            instance.publishState("is_connected", false);
        } else {
            console.error("Provider not found");
        }
    };

    const signMessage = async (message, providerId) => {
        if (!provider || provider.providerId !== providerId) {
            provider = getProvider(providerId);
        }

        if (provider) {
            const encodedMessage = new TextEncoder().encode(message);
            const { signature } = await provider.signMessage(encodedMessage, "utf8");
            console.log("Message signed", signature.toString());
            instance.publishState("signed_message", signature.toString());
            instance.triggerEvent("message_signed");
        }
    };
    const transferToken = async (mint, amount, receiver, providerId) => {
        try {
            if (!provider || provider.providerId !== providerId) {
                provider = getProvider(providerId);
            }
            if (provider && provider.publicKey) {
                const senderAdr = provider.publicKey.toString();
                const myHeaders = new Headers();
                myHeaders.append("x-api-key", SHYFT_API_KEY);
                myHeaders.append("Content-Type", "application/json");

                const raw = JSON.stringify({
                    network: "mainnet-beta",
                    from_address: senderAdr,
                    to_address: receiver,
                    token_address: mint,
                    amount: amount
                });

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                const response = await fetch(
                    "https://api.shyft.to/sol/v1/token/transfer_detach",
                    requestOptions
                );
                const result = await response.json();
                if (result.success) {
                    const strTx = result["result"].encoded_transaction;
                    const txBuf = buffer.Buffer.from(strTx, "base64");
                    //console.log(solanaWeb3.Transaction);
                    const tx = solanaWeb3.Transaction.from(txBuf);

                    const { signature } = await provider.signAndSendTransaction(tx, { skipPreflight: true });
                    console.log("Signature", signature);
                    if (signature) {
                        console.log("Signature", signature);
                        instance.publishState("tx_signature", signature);
                        instance.triggerEvent("transaction_sent");
                        await getTransacationStatus(signature);
                        // instance.triggerEvent("transaction_confirmed");
                    }
                }
                console.log(result);
            }
        } catch (error) {
            console.log("error", error);
        }
    };
    const handleSwap = async (
        inputMint,
        outputMint,
        decimals,
        amount,
        slippage,
        providerId,
        fee
    ) => {
        if (!provider || provider.providerId !== providerId) {
            provider = getProvider(providerId);
        }
        try {
            if (provider && provider.publicKey) {
                const quoteResponse = await (
                    await fetch(
                        "https://quote-api.jup.ag/v6/quote?inputMint=" +
                        inputMint.trim() +
                        "&outputMint=" +
                        outputMint.trim() +
                        "&amount=" +
                        (amount * 10 ** decimals).toString() +
                        "&slippageBps=" +
                        slippage +
                        "&platformFeeBps=" +
                        fee
                    )
                ).json();
                const [feetAccount, _] = solanaWeb3.PublicKey.findProgramAddressSync(
                    [
                        buffer.Buffer.from("referral_ata", "utf8"),
                        new solanaWeb3.PublicKey(
                            swapRef
                        ).toBuffer(),
                        new solanaWeb3.PublicKey(outputMint).toBuffer()
                    ],
                    new solanaWeb3.PublicKey(
                        "REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3"
                    )
                );

                const { swapTransaction } = await (
                    await fetch("https://quote-api.jup.ag/v6/swap", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            quoteResponse,
                            userPublicKey: provider.publicKey.toString(),
                            wrapAndUnwrapSol: true,
                            feeAccount: feetAccount,
                            computeUnitPriceMicroLamports: 1,
                            asLegacyTransaction: false,
                        })
                    })
                ).json();
                const swapTransactionBuf = buffer.Buffer.from(
                    swapTransaction,
                    "base64"
                );
                const transaction =
                    solanaWeb3.VersionedTransaction.deserialize(swapTransactionBuf);
                const { signature } = await provider.signAndSendTransaction(
                    transaction
                );
                if (signature) {
                    instance.publishState("tx_signature", signature);
                    instance.triggerEvent("transaction_sent");
                    await getTransacationStatus(signature);
                }
            }
        } catch (err) {
            console.log("swap error", err);
        }
    };
    const getSwapQuote = async (
        inputMint,
        outputMint,
        inputDecimals,
        outputDecimals,
        inAmount,
        slippage,
        providerId,
        fee
    ) => {
        if (!provider || provider.providerId !== providerId) {
            provider = getProvider(providerId);
        }
        try {
            if (provider && provider.publicKey) {
                const quoteResponse = await (
                    await fetch(
                        "https://quote-api.jup.ag/v6/quote?inputMint=" +
                        inputMint.trim() +
                        "&outputMint=" +
                        outputMint.trim() +
                        "&amount=" +
                        (inAmount * 10 ** inputDecimals).toString() +
                        "&slippageBps=" +
                        slippage +
                        "&platformFeeBps=" +
                        fee
                    )
                ).json();
                const outQuote = (
                    quoteResponse.outAmount /
                    10 ** outputDecimals
                ).toString();
                console.log("OUT QUOTE", outQuote);
                instance.publishState("swap_quote", outQuote);
            }
        } catch (err) {
            console.log("swap error", err);
        }
    };
    const fetchNfts = async (pubAdr) => {
        try {
            const myHeaders = new Headers();
            myHeaders.append("x-api-key", SHYFT_API_KEY);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };

            const response = await fetch(
                `https://api.shyft.to/sol/v1/nft/read_all?network=mainnet-beta&address=${pubAdr}`,
                requestOptions
            );

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const result = await response.json();
            console.log(result);
            instance.publishState("nft_list", JSON.stringify(result.result));
        } catch (error) {
            console.log("error", error);
        }
    };
    const getSolBalance = async (providerId) => {
        if (!provider || provider.providerId !== providerId) {
            provider = getProvider(providerId);
        }
        if (provider && provider.publicKey) {
            const connection = new solanaWeb3.Connection(RPC_URL);
            const lamports = await connection.getBalance(provider.publicKey);
            const solBalance = lamports / solanaWeb3.LAMPORTS_PER_SOL;
            console.log("SOL BALANCE", solBalance.toString());
            instance.publishState("sol_balance", solBalance.toString());
        }
    };
    const getTransacationStatus = async (tx) => {
        const connection = new solanaWeb3.Connection(RPC_URL);

        try {
            const latestBlockhash = await connection.getLatestBlockhash();
            const confirmation = await connection.confirmTransaction({
                signature: tx,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            });

            if (confirmation.value.err) {
                console.log("Transaction failed");
                instance.publishState("transaction_status", "FAILED");
                instance.triggerEvent("transaction_failed");
                return;
            }

            const txInfo = await connection.getTransaction(tx, {
                maxSupportedTransactionVersion: 0
            });

            if (txInfo && txInfo.meta && !txInfo.meta.err) {
                console.log("Transaction confirmed successfully");
                instance.publishState("transaction_status", "SUCCESS");
                instance.triggerEvent("transaction_confirmed");
            } else {
                console.log("Transaction failed");
                instance.publishState("transaction_status", "FAILED");
                instance.triggerEvent("transaction_failed");
            }

        } catch (error) {
            console.log("Transaction confirmation error:", error);
            if (error.message.includes("was not confirmed")) {
                instance.triggerEvent("transaction_timeout");
            } else {
                instance.triggerEvent("transaction_failed");
            }
        }
    };
    const getTokenBalanceByWallet = async (walletAdr) => {
        try {
            const myHeaders = new Headers();
            myHeaders.append("x-api-key", SHYFT_API_KEY);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow"
            };

            const response = await fetch(
                `https://api.shyft.to/sol/v1/wallet/all_tokens?network=mainnet-beta&wallet=${walletAdr}`,
                requestOptions
            );

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const result = await response.json();
            console.log(result);
            instance.publishState(
                "token_balance_list",
                JSON.stringify(result.result)
            );
        } catch (error) {
            console.log("error", error);
        }
    };
    const createNFT = async (
        providerId,
        name,
        symbol,
        description,
        attributes,
        externalUrl,
        maxSupply,
        royalty,
        imageFile
    ) => {
        if (!provider || provider.providerId !== providerId) {
            provider = getProvider(providerId);
        }
        if (provider && provider.publicKey) {
            const myHeaders = new Headers();
            myHeaders.append("x-api-key", SHYFT_API_KEY);

            const formdata = new FormData();
            formdata.append("network", "mainnet-beta");
            formdata.append("creator_wallet", provider.publicKey.toString());
            formdata.append("name", name);
            formdata.append("symbol", symbol);
            formdata.append("description", description);
            formdata.append("attributes", JSON.stringify(attributes));
            formdata.append("external_url", externalUrl);
            formdata.append("max_supply", maxSupply);
            formdata.append("royalty", royalty);
            formdata.append("image", imageFile);
            formdata.append("fee_payer", provider.publicKey.toString());

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: formdata,
                redirect: "follow"
            };

            try {
                const response = await fetch(
                    "https://api.shyft.to/sol/v2/nft/create",
                    requestOptions
                );
                const result = await response.json();
                console.log(result);
                if (result.success) {
                    const strTx = result["result"].encoded_transaction;
                    const txBuf = buffer.Buffer.from(strTx, "base64");
                    console.log(solanaWeb3.Transaction);
                    const tx = solanaWeb3.Transaction.from(txBuf);
                    const modifyComputeUnits = solanaWeb3.ComputeBudgetProgram.setComputeUnitLimit({
                        units: 1000000
                    });

                    const addPriorityFee = solanaWeb3.ComputeBudgetProgram.setComputeUnitPrice({
                        microLamports: 1
                    });
                    tx.add(modifyComputeUnits).add(addPriorityFee);

                    const { signature } = await provider.signAndSendTransaction(tx);
                    if (signature) {
                        instance.publishState("tx_signature", signature);
                        // instance.triggerEvent("transaction_confirmed");
                        instance.triggerEvent("transaction_sent");
                        await getTransacationStatus(signature);
                    }
                }
            } catch (error) {
                console.error("error", error);
                throw error;
            }
        }
    };
    const sendNativeSol = async (providerId, amountInSol, receiverAdr) => {
        if (!provider || provider.providerId !== providerId) {
            provider = getProvider(providerId);
        }
        if (provider && provider.publicKey) {
            console.log("Receiver", receiverAdr);
            window.Buffer = buffer.Buffer;
            const connection = new solanaWeb3.Connection(RPC_URL);
            const lamports = amountInSol * solanaWeb3.LAMPORTS_PER_SOL;
            const recentBlockhash = await connection.getRecentBlockhash();
            const modifyComputeUnits = solanaWeb3.ComputeBudgetProgram.setComputeUnitLimit({
                units: 1000000
            });

            const addPriorityFee = solanaWeb3.ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1
            });
            const transaction = new solanaWeb3.Transaction({
                feePayer: provider.publicKey,
                recentBlockhash: recentBlockhash.blockhash
            })
                .add(modifyComputeUnits)
                .add(addPriorityFee)
                .add(
                    solanaWeb3.SystemProgram.transfer({
                        fromPubkey: provider.publicKey,
                        toPubkey: new solanaWeb3.PublicKey(receiverAdr),
                        lamports: lamports
                    })
                );
            const { signature } = await provider.signAndSendTransaction(transaction);
            if (signature) {
                instance.publishState("tx_signature", signature);
                instance.triggerEvent("transaction_sent");
                await getTransacationStatus(signature);
                // instance.triggerEvent("transaction_confirmed");
            }
        }
    };
    const handleSwapPay = async (
        providerId,
        inputSymbol,
        inputMint,
        inputDecimals,
        payAmountInUSDC,
        receiverUSDCATA
    ) => {
        if (!provider || provider.providerId !== providerId) {
            provider = getProvider(providerId);
        }
        try {
            if (provider && provider.publicKey) {
                // Fetch token price data
                const response = await fetch(
                    `https://price.jup.ag/v4/price?ids=${inputSymbol}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json();
                const tokenSymbol = Object.keys(data.data)[0];
                const tokenPrice = data.data[tokenSymbol].price;

                // Calculate token amount needed to get payAmountInUSDC
                const tokenAmount = (payAmountInUSDC / tokenPrice).toFixed(inputDecimals);
                console.log(
                    `Amount of ${tokenSymbol} needed to get ${payAmountInUSDC} USDC: ${tokenAmount}`
                );

                // Fetch quote response
                const quoteResponse = await (
                    await fetch(
                        "https://quote-api.jup.ag/v6/quote?inputMint=" +
                        inputMint.trim() +
                        "&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=" +
                        Math.round(tokenAmount * 10 ** inputDecimals).toString() +
                        "&slippageBps=" +
                        100 +
                        "&platformFeeBps=" +
                        25
                    )
                ).json();
                const [feetAccount, _] = solanaWeb3.PublicKey.findProgramAddressSync(
                    [
                        buffer.Buffer.from("referral_ata", "utf8"),
                        new solanaWeb3.PublicKey(
                            swapRef
                        ).toBuffer(),
                        new solanaWeb3.PublicKey(
                            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                        ).toBuffer()
                    ],
                    new solanaWeb3.PublicKey("REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3")
                );
                // Fetch swap transaction
                const { swapTransaction } = await (
                    await fetch("https://quote-api.jup.ag/v6/swap", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            quoteResponse,
                            destinationTokenAccount: receiverUSDCATA,
                            userPublicKey: provider.publicKey.toString(),
                            wrapAndUnwrapSol: true,
                            feeAccount: feetAccount,
                            computeUnitPriceMicroLamports: 1,
                            asLegacyTransaction: false,
                        })
                    })
                ).json();

                const swapTransactionBuf = buffer.Buffer.from(swapTransaction, "base64");
                const transaction =
                    solanaWeb3.VersionedTransaction.deserialize(swapTransactionBuf);

                // Sign and send transaction
                const { signature } = await provider.signAndSendTransaction(transaction);
                if (signature) {
                    instance.publishState("tx_signature", signature);
                    instance.triggerEvent("transaction_sent");
                    await getTransacationStatus(signature);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            instance.triggerEvent("transaction_canceled");
            instance.triggerEvent("catch_error");
        }
    };

    instance.data.connect = connectWallet;
    instance.data.disconnect = disconnectWallet;
    instance.data.signMessage = signMessage;
    instance.data.transferToken = transferToken;
    instance.data.swapToken = handleSwap;
    instance.data.fetchNfts = fetchNfts;
    instance.data.getSolBalance = getSolBalance;
    instance.data.getTokenBalanceByWallet = getTokenBalanceByWallet;
    instance.data.createNFT = createNFT;
    instance.data.getTransacationStatus = getTransacationStatus;
    instance.data.sendNativeSol = sendNativeSol;
    instance.data.getSwapQuote = getSwapQuote;
    instance.data.handleSwapPay = handleSwapPay;
}
