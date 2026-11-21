import {
  Avatar,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RamenDiningOutlinedIcon from "@mui/icons-material/RamenDiningOutlined";
import EmptyState from "../components/EmptyState.jsx";
import { formatTime } from "../utils.js";

/** Screen 4: plans saved to this device (localStorage). */
export default function SavedScreen({ plans, onOpen, onDelete, onGoPantry }) {
  if (plans.length === 0) {
    return (
      <EmptyState
        Icon={BookmarkBorderIcon}
        title="Your saved plans live here"
        body="Build a prep plan and tap Save plan to keep it on this device."
        actionLabel="Start a plan"
        onAction={onGoPantry}
      />
    );
  }

  return (
    <Card>
      <List disablePadding>
        {plans.map((plan, i) => {
          const first = plan.scheduleBlocks?.[0];
          const when = first ? `${first.day} ${formatTime(first.start_time)} · ` : "";
          return (
            <ListItem
              key={plan.id}
              disablePadding
              divider={i < plans.length - 1}
              secondaryAction={
                <IconButton edge="end" aria-label={`Delete ${plan.selectedRecipe?.title}`} onClick={() => onDelete(plan.id)}>
                  <DeleteOutlineIcon />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => onOpen(plan)}>
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    sx={{ bgcolor: "primaryContainer.main", color: "primaryContainer.contrastText", borderRadius: "12px" }}
                  >
                    <RamenDiningOutlinedIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={plan.selectedRecipe?.title}
                  secondary={`${when}${plan.servings} ${plan.servings === 1 ? "serving" : "servings"}`}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
}
