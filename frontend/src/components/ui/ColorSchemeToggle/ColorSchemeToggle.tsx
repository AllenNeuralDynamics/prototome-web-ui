import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { useThemeStore } from "@/stores/themeStore";
import { IconMoon, IconSun } from "@tabler/icons-react";

export const ColorSchemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useThemeStore();
  const { colorScheme: mantineColorScheme, setColorScheme } = useMantineColorScheme();
  const handleToggle = () => {
    toggleColorScheme();
    setColorScheme(mantineColorScheme === "light" ? "dark" : "light");
  }
  return (
    <ActionIcon
      variant="default"
      size={42}
      onClick={handleToggle}
    >
      {colorScheme === "light" ? <IconSun /> : <IconMoon />}
    </ActionIcon>
  );
};
