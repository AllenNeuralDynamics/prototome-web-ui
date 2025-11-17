import { useThemeStore } from "@/stores/themeStore";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

const ColorSchemeToggle = () => {
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

export default ColorSchemeToggle;
