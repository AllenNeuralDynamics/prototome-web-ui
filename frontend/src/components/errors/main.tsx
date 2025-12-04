import { Text } from '@mantine/core';

export const MainErrorFallback = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center text-red-500">
      <Text> Something went terribly wrong </Text>
    </div>
  );
};