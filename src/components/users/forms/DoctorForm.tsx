import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { UseFormReturn, useFieldArray } from "react-hook-form";
import { UserFormData } from "../schema";
import { useTags } from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import MultipleSelector from "@/components/ui/multi-selector";
import { useEffect } from "react";

interface DoctorFormProps {
  form: UseFormReturn<UserFormData>;
}

export function DoctorForm({ form }: DoctorFormProps) {
  const { data: specialtyTags, isLoading: isLoadingTags } = useTags(1, 100);
  
  // Transform tags data into the format expected by MultipleSelector
  const tagOptions = (specialtyTags?.data?.items || []).map(tag => ({
    label: tag.name,
    value: tag._id
  }));

  const educationFields = useFieldArray({
    control: form.control,
    name: "doctorFields.education"
  });

  const experienceFields = useFieldArray({
    control: form.control,
    name: "doctorFields.experience"
  });

  // Initialize doctor fields if they don't exist
  useEffect(() => {
    const doctorFields = form.getValues('doctorFields');
    if (!doctorFields) {
      form.setValue('doctorFields', {
        description: '',
        about: '',
        specialities: [],
        education: [],
        experience: []
      });
    }
  }, [form]);

  return (
    <div className="space-y-4">
      {/* Basic doctor fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="doctorFields.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="doctorFields.about"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Specialties field */}
      <FormField
        control={form.control}
        name="doctorFields.specialities"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Specialties</FormLabel>
            <FormControl>
              <MultipleSelector
                defaultOptions={tagOptions}
                placeholder="Select specialties..."
                value={tagOptions.filter(opt => (field.value || []).includes(opt.value))}
                onChange={(selected) => {
                  field.onChange(selected.map(item => item.value));
                }}
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                    No specialties found.
                  </p>
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Education Fields */}
      <div className="space-y-2">
        <FormLabel>Education</FormLabel>
        {educationFields.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <FormField
              control={form.control}
              name={`doctorFields.education.${index}.degree`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="Degree" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`doctorFields.education.${index}.institution`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="Institution" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`doctorFields.education.${index}.year`}
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormControl>
                    <Input {...field} type="number" placeholder="Year" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => educationFields.remove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => educationFields.append({
            degree: '',
            institution: '',
            year: new Date().getFullYear()
          })}
        >
          Add Education
        </Button>
      </div>

      {/* Experience Fields */}
      <div className="space-y-2">
        <FormLabel>Experience</FormLabel>
        {experienceFields.fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <FormField
              control={form.control}
              name={`doctorFields.experience.${index}.hospital`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="Hospital" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`doctorFields.experience.${index}.position`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="Position" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`doctorFields.experience.${index}.startYear`}
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormControl>
                    <Input {...field} type="number" placeholder="Start Year" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => experienceFields.remove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => experienceFields.append({
            hospital: '',
            position: '',
            startYear: new Date().getFullYear(),
            current: true
          })}
        >
          Add Experience
        </Button>
      </div>
    </div>
  );
}