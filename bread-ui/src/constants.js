import KitchenOutlinedIcon from "@mui/icons-material/KitchenOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

// Navigation tabs (bottom bar on phones, side rail on wider screens).
export const TABS = [
  { value: "pantry", label: "Pantry", title: "Your pantry", Icon: KitchenOutlinedIcon },
  { value: "recipes", label: "Recipes", title: "Top picks for you", Icon: RestaurantMenuIcon },
  { value: "plan", label: "Plan", title: "Prep plan", Icon: EventNoteOutlinedIcon },
  { value: "saved", label: "Saved", title: "Saved plans", Icon: BookmarkBorderIcon },
];

// Hard-constraint presets shown as chips on the Pantry screen.
export const EXCLUSION_OPTIONS = ["peanuts", "tree_nuts", "dairy", "gluten", "shellfish"];
export const EQUIPMENT_OPTIONS = ["skillet", "rice_cooker", "microwave", "oven", "blender"];
