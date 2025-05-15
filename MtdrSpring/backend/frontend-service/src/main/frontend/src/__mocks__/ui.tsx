import React, {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ImgHTMLAttributes,
} from "react";
import { TaskItemProps } from "@/components/ui/Task-item";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

interface AvatarProps {
  children: React.ReactNode;
  [key: string]: any;
}

interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

interface AvatarFallbackProps {
  children: React.ReactNode;
  [key: string]: any;
}

// Mock UI components
export const Button = ({ children, ...props }: ButtonProps) => (
  <button {...props}>{children}</button>
);

export const Input = (props: InputProps) => <input {...props} />;

export const Checkbox = (props: InputProps) => (
  <input type="checkbox" {...props} />
);

export const Label = ({ children, ...props }: LabelProps) => (
  <label {...props}>{children}</label>
);

export const Avatar = ({ children, ...props }: AvatarProps) => (
  <div {...props}>{children}</div>
);

export const AvatarImage = (props: AvatarImageProps) => <img {...props} />;

export const AvatarFallback = ({ children, ...props }: AvatarFallbackProps) => (
  <div {...props}>{children}</div>
);

export const TaskItem: React.FC<TaskItemProps> = ({
  title,
  description,
  status,
  priority,
}) => (
  <div data-testid="task-item">
    <h3>{title}</h3>
    <p>{description}</p>
    <span>{status}</span>
    <span>{priority}</span>
  </div>
);
