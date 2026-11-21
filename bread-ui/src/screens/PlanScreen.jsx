import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import CheckIcon from "@mui/icons-material/Check";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import OfflineBoltOutlinedIcon from "@mui/icons-material/OfflineBoltOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EmptyState from "../components/EmptyState.jsx";
import { DAYS, formatQty, formatTime, isFoodSafetyStep } from "../utils.js";

function SourceChip({ source }) {
  const isAi = source === "gemini";
  return (
    <Chip
      size="small"
      icon={isAi ? <AutoAwesomeIcon /> : <OfflineBoltOutlinedIcon />}
      label={isAi ? "Scheduled by Gemini" : "Offline fallback schedule"}
      sx={{
        bgcolor: isAi ? "secondaryContainer.main" : "action.selected",
        color: isAi ? "secondaryContainer.contrastText" : "text.primary",
        "& .MuiChip-icon": { color: "inherit" },
      }}
    />
  );
}

function groupByDay(blocks) {
  const groups = {};
  for (const b of blocks) (groups[b.day] ||= []).push(b);
  return Object.entries(groups).sort(([a], [b]) => DAYS.indexOf(a) - DAYS.indexOf(b));
}

function TimelineStep({ block, editing, onToggle, onChange }) {
  const safety = isFoodSafetyStep(block.step_text);
  return (
    <Box sx={{ display: "flex", gap: 1.5, pb: 2, position: "relative" }}>
      <Checkbox
        checked={!!block.checked}
        onChange={onToggle}
        sx={{ p: 0.5, alignSelf: "flex-start", bgcolor: "background.default", zIndex: 1 }}
        slotProps={{ input: { "aria-label": `Done: ${block.step_text}` } }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                type="time"
                label="Start"
                value={block.start_time}
                onChange={(e) => onChange("start_time", e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                size="small"
                type="time"
                label="End"
                value={block.end_time}
                onChange={(e) => onChange("end_time", e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <TextField
              size="small"
              multiline
              label="Step"
              value={block.step_text}
              onChange={(e) => onChange("step_text", e.target.value)}
            />
          </Stack>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary">
              {formatTime(block.start_time)} – {formatTime(block.end_time)} · {block.duration_min} min
            </Typography>
            <Typography
              variant="body2"
              sx={{
                textDecoration: block.checked ? "line-through" : "none",
                color: block.checked ? "text.secondary" : "text.primary",
              }}
            >
              {block.step_text}
            </Typography>
            {safety && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "warning.main", mt: 0.5 }}>
                <WarningAmberIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">Food safety: check the internal temperature</Typography>
              </Stack>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

/** Screen 3: scaled shopping list + AI prep schedule laid out on a timeline. */
export default function PlanScreen({
  recipe,
  servings,
  source,
  shoppingList,
  setShoppingList,
  blocks,
  setBlocks,
  onSave,
  isSaved,
  onGoRecipes,
}) {
  const [editing, setEditing] = useState(false);

  if (!recipe) {
    return (
      <EmptyState
        Icon={EventNoteOutlinedIcon}
        title="No plan yet"
        body="Pick a recipe and Bread will fit the prep steps into your free time."
        actionLabel="Browse recipes"
        onAction={onGoRecipes}
      />
    );
  }

  const toggleShop = (id) =>
    setShoppingList(shoppingList.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  const toggleBlock = (id) =>
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, checked: !b.checked } : b)));
  const updateBlock = (id, field, value) =>
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, [field]: value } : b)));

  const doneCount = blocks.filter((b) => b.checked).length;

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
          {recipe.title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <SourceChip source={source} />
          <Typography variant="body2" color="text.secondary">
            {servings} {servings === 1 ? "serving" : "servings"} · {recipe.total_minutes} min
          </Typography>
        </Stack>
      </Box>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Shopping list
      </Typography>
      <Card sx={{ mb: 3 }}>
        {shoppingList.length > 0 ? (
          <List disablePadding>
            {shoppingList.map((item, i) => (
              <ListItem key={item.id} disablePadding divider={i < shoppingList.length - 1}>
                <ListItemButton onClick={() => toggleShop(item.id)} dense>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox edge="start" checked={item.checked} tabIndex={-1} disableRipple />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${formatQty(item.qty)} ${item.unit} ${item.name}`}
                    sx={{
                      textDecoration: item.checked ? "line-through" : "none",
                      color: item.checked ? "text.secondary" : "text.primary",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ p: 2 }} color="text.secondary">
            You already have everything.
          </Typography>
        )}
      </Card>

      <Stack direction="row" sx={{ alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>
          Prep schedule · {doneCount}/{blocks.length} done
        </Typography>
        <Button
          size="small"
          startIcon={editing ? <CheckIcon /> : <EditOutlinedIcon />}
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Done" : "Edit"}
        </Button>
      </Stack>

      {groupByDay(blocks).map(([day, dayBlocks]) => (
        <Box key={day} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
            {day}
          </Typography>
          {/* vertical timeline line behind the checkboxes */}
          <Box sx={{ position: "relative", "&::before": { content: '""', position: "absolute", left: 16, top: 8, bottom: 16, borderLeft: 2, borderColor: "primary.main", opacity: 0.4 } }}>
            {dayBlocks.map((block) => (
              <TimelineStep
                key={block.id}
                block={block}
                editing={editing}
                onToggle={() => toggleBlock(block.id)}
                onChange={(field, value) => updateBlock(block.id, field, value)}
              />
            ))}
          </Box>
        </Box>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={isSaved ? <BookmarkAddedIcon /> : <BookmarkAddOutlinedIcon />}
          onClick={onSave}
        >
          {isSaved ? "Saved" : "Save plan"}
        </Button>
      </Box>
    </>
  );
}
