import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { DAYS, formatTime, prettyLabel } from "../utils.js";
import { EQUIPMENT_OPTIONS, EXCLUSION_OPTIONS } from "../constants.js";

function SectionLabel({ children }) {
  return (
    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
      {children}
    </Typography>
  );
}

function FilterChips({ options, selected, onToggle }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {options.map((item) => {
        const on = selected.includes(item);
        return (
          <Chip
            key={item}
            label={prettyLabel(item)}
            icon={on ? <CheckIcon /> : undefined}
            color={on ? "secondary" : "default"}
            variant={on ? "filled" : "outlined"}
            onClick={() => onToggle(item)}
            aria-pressed={on}
          />
        );
      })}
    </Box>
  );
}

function AddWindowDialog({ open, onClose, onAdd }) {
  const [day, setDay] = useState("Thu");
  const [start, setStart] = useState("18:00");
  const [end, setEnd] = useState("18:45");
  const invalid = !start || !end || end <= start;

  const handleAdd = () => {
    if (invalid) return;
    onAdd({ id: Date.now(), day, start, end });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add free time</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField select label="Day" value={day} onChange={(e) => setDay(e.target.value)}>
            {DAYS.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="End"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              error={invalid}
              helperText={invalid ? "End must be after start" : " "}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAdd} disabled={invalid}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Screen 1: pantry text + hard constraints (allergens, equipment, free time). */
export default function PantryScreen({
  pantryText,
  setPantryText,
  exclusions,
  toggleExclusion,
  equipment,
  toggleEquipment,
  freeWindows,
  setFreeWindows,
  onLoadSample,
  onSubmit,
  loading,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const pantryEmpty = pantryText.trim() === "";
  const noWindows = freeWindows.length === 0;

  const handleSubmit = () => {
    setTouched(true);
    if (pantryEmpty || noWindows) return;
    onSubmit();
  };

  return (
    <>
      <Card
        variant="elevation"
        elevation={0}
        sx={{ bgcolor: "primaryContainer.main", color: "primaryContainer.contrastText", p: 2, mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <AutoAwesomeIcon fontSize="small" sx={{ mt: 0.25 }} />
          <Typography variant="body2">
            Type what you have the way you'd say it. Bread matches it to real ingredients and
            finds recipes that fit your time and kitchen.
          </Typography>
        </Stack>
      </Card>

      <TextField
        label="What's in your kitchen?"
        placeholder="2 chx breast, green onions, leftover rice, soy sauce"
        value={pantryText}
        onChange={(e) => setPantryText(e.target.value)}
        multiline
        minRows={3}
        fullWidth
        error={touched && pantryEmpty}
        helperText={touched && pantryEmpty ? "Add at least one ingredient" : "Separate items with commas"}
      />
      <Button size="small" startIcon={<ScienceOutlinedIcon />} onClick={onLoadSample} sx={{ mt: 1 }}>
        Use sample pantry
      </Button>

      <SectionLabel>Avoid</SectionLabel>
      <FilterChips options={EXCLUSION_OPTIONS} selected={exclusions} onToggle={toggleExclusion} />

      <SectionLabel>Equipment you have</SectionLabel>
      <FilterChips options={EQUIPMENT_OPTIONS} selected={equipment} onToggle={toggleEquipment} />

      <SectionLabel>Free time</SectionLabel>
      {freeWindows.length > 0 && (
        <Card sx={{ mb: 1 }}>
          <List disablePadding>
            {freeWindows.map((w, i) => (
              <ListItem
                key={w.id}
                divider={i < freeWindows.length - 1}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label={`Remove ${w.day} window`}
                    onClick={() => setFreeWindows(freeWindows.filter((x) => x.id !== w.id))}
                  >
                    <CloseIcon />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText primary={`${w.day}, ${formatTime(w.start)} – ${formatTime(w.end)}`} />
              </ListItem>
            ))}
          </List>
        </Card>
      )}
      {touched && noWindows && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Add at least one free time window so Bread can schedule your prep.
        </Alert>
      )}
      <Button startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
        Add window
      </Button>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SearchIcon />}
          onClick={handleSubmit}
          loading={loading}
          loadingPosition="start"
        >
          Find recipes
        </Button>
      </Box>

      {dialogOpen && (
        <AddWindowDialog
          open
          onClose={() => setDialogOpen(false)}
          onAdd={(w) => setFreeWindows([...freeWindows, w])}
        />
      )}
    </>
  );
}
