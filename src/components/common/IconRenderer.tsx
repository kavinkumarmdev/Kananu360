import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  className = 'w-5 h-5',
  size = 20,
  color,
}) => {
  // @ts-ignore
  const IconComponent = Icons[name] || Icons.CircleDollarSign;

  return <IconComponent className={className} size={size} color={color} />;
};
