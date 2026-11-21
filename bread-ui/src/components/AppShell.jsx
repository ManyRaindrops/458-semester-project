import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  ButtonBase,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useColorScheme, useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { TABS } from "../constants.js";

// Material 3 style "active indicator" pill behind the nav icon.
function NavIcon({ Icon, active }) {
  return (
    <Box
      sx={{
        width: 56,
        height: 32,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: active ? "primaryContainer.main" : "transparent",
        color: active ? "primaryContainer.contrastText" : "text.secondary",
        transition: "background-color 150ms",
      }}
    >
      <Icon />
    </Box>
  );
}

// Desktop / tablet: vertical navigation rail on the left.
function NavRail({ tab, onTabChange }) {
  return (
    <Box
      component="nav"
      sx={{
        width: 88,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        position: "sticky",
        top: 0,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        pt: 2,
      }}
    >
      <BakeryDiningIcon color="primary" sx={{ fontSize: 32, mb: 2 }} aria-label="Bread" />
      {TABS.map(({ value, label, Icon }) => {
        const active = tab === value;
        return (
          <ButtonBase
            key={value}
            onClick={() => onTabChange(value)}
            aria-current={active ? "page" : undefined}
            sx={{ flexDirection: "column", gap: 0.5, borderRadius: 4, py: 0.5, width: 72 }}
          >
            <NavIcon Icon={Icon} active={active} />
            <Typography
              variant="caption"
              sx={{ fontWeight: active ? 500 : 400, color: active ? "text.primary" : "text.secondary" }}
            >
              {label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  if (!mode) return null; // not resolved yet on first render
  const isDark = (mode === "system" ? systemMode : mode) === "dark";
  return (
    <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
      <IconButton onClick={() => setMode(isDark ? "light" : "dark")} aria-label="Toggle dark mode">
        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}

/**
 * Responsive app frame: top app bar + bottom navigation on phones,
 * navigation rail on wider screens.
 */
export default function AppShell({ tab, onTabChange, onBack, loading, children }) {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up("md"));
  const current = TABS.find((t) => t.value === tab);

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      {isWide && <NavRail tab={tab} onTabChange={onTabChange} />}

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ bgcolor: "background.default", borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar sx={{ gap: 1 }}>
            {onBack ? (
              <IconButton edge="start" onClick={onBack} aria-label="Back">
                <ArrowBackIcon />
              </IconButton>
            ) : (
              !isWide && <BakeryDiningIcon color="primary" sx={{ mr: 1 }} aria-hidden />
            )}
            <Typography variant="h6" component="h1" sx={{ flex: 1 }} noWrap>
              {current?.title}
            </Typography>
            <ThemeToggle />
          </Toolbar>
          {loading && <LinearProgress sx={{ position: "absolute", left: 0, right: 0, bottom: 0 }} />}
        </AppBar>

        <Container component="main" maxWidth="sm" sx={{ flex: 1, py: 2, pb: isWide ? 4 : 13 }}>
          {children}
        </Container>
      </Box>

      {!isWide && (
        <Paper
          elevation={3}
          square
          sx={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: (t) => t.zIndex.appBar }}
        >
          <BottomNavigation
            showLabels
            value={tab}
            onChange={(_, value) => onTabChange(value)}
            sx={{ height: 80, pb: "env(safe-area-inset-bottom)" }}
          >
            {TABS.map(({ value, label, Icon }) => (
              <BottomNavigationAction
                key={value}
                value={value}
                label={label}
                icon={<NavIcon Icon={Icon} active={tab === value} />}
                sx={{
                  gap: 0.5,
                  minWidth: 0,
                  "&.Mui-selected": { color: "text.primary" },
                  "& .MuiBottomNavigationAction-label.Mui-selected": { fontSize: 12, fontWeight: 500 },
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
