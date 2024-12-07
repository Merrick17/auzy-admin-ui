import { useAtom } from 'jotai';
import { usersAtom, selectedUserAtom, doctorsAtom } from '../atoms/users';
import axios from 'axios';

export const useUsers = () => {
  const [users, setUsers] = useAtom(usersAtom);
  const [selectedUser, setSelectedUser] = useAtom(selectedUserAtom);
  const [doctors, setDoctors] = useAtom(doctorsAtom);

  const fetchUsers = async () => {
    const response = await axios.get('/users');
    setUsers(response.data);
  };

  const fetchDoctors = async (speciality?: string) => {
    const response = await axios.get('/users/doctors', {
      params: { speciality },
    });
    setDoctors(response.data);
  };

  const updateUser = async (id: string, userData: any) => {
    const response = await axios.patch(`/users/${id}`, userData);
    setUsers(users.map(user => user.id === id ? response.data : user));
    return response.data;
  };

  return {
    users,
    selectedUser,
    doctors,
    fetchUsers,
    fetchDoctors,
    updateUser,
    setSelectedUser,
  };
}; 