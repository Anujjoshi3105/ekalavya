import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subjectsColors } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSubjectColor = (subject: string) => {
  return subjectsColors[subject as keyof typeof subjectsColors];
};

export const formUrlQuery = ({
  params,
  key,
  value,
}: {
  params: { [key: string]: string };
  key: string;
  value: string;
}) => {
  const newParams = new URLSearchParams(params);
  newParams.set(key, value);
  return `?${newParams.toString()}`;
};

export const removeKeysFromUrlQuery = ({
  params,
  keysToRemove,
}: {
  params: { [key: string]: string };
  keysToRemove: string[];
}) => {
  const newParams = new URLSearchParams(params);
  keysToRemove.forEach((key) => newParams.delete(key));
  return `?${newParams.toString()}`;
};
