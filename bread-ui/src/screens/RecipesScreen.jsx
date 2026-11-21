import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import EmptyState from "../components/EmptyState.jsx";
import { formatQty, prettyLabel } from "../utils.js";

const BREAKDOWN_LABELS = {
  pantry_coverage: "Pantry match",
  time_fit: "Time fit",
  variety: "Variety",
};

function ScoreBreakdown({ breakdown }) {
  return (
    <Box
      sx={{ display: "grid", gridTemplateColumns: "96px 1fr 36px", gap: 1, alignItems: "center", my: 1.5 }}
    >
      {Object.entries(breakdown).map(([key, value]) => (
        <Box key={key} sx={{ display: "contents" }}>
          <Typography variant="caption" color="text.secondary">
            {BREAKDOWN_LABELS[key] || prettyLabel(key)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.round(value * 100)}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" sx={{ textAlign: "right" }}>
            {Math.round(value * 100)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function RecipeCard({ recipe, rank, servings, onSelect, loading }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            {rank === 0 && (
              <Typography variant="overline" color="primary" sx={{ lineHeight: 1.5 }}>
                Best match
              </Typography>
            )}
            <Typography variant="h6" component="h2" sx={{ lineHeight: 1.3 }}>
              {recipe.title}
            </Typography>
          </Box>
          <Chip
            label={Math.round(recipe.total_score * 100)}
            aria-label={`Score ${Math.round(recipe.total_score * 100)} out of 100`}
            sx={{ bgcolor: "primaryContainer.main", color: "primaryContainer.contrastText", fontWeight: 500 }}
          />
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "text.secondary", mt: 0.5 }}>
          <AccessTimeIcon sx={{ fontSize: 16 }} />
          <Typography variant="body2">{recipe.total_minutes} min</Typography>
        </Stack>

        <ScoreBreakdown breakdown={recipe.breakdown} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {recipe.explanation}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {recipe.matched_ingredients.map((ing) => (
            <Chip key={ing} size="small" label={prettyLabel(ing)} color="secondary" variant="outlined" />
          ))}
        </Box>
        {recipe.missing_ingredients.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            <Box component="span" sx={{ color: "text.secondary" }}>
              To buy:{" "}
            </Box>
            {recipe.missing_ingredients
              .map((m) => `${formatQty(m.base_qty * servings)} ${m.unit} ${m.name}`)
              .join(", ")}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
        <Button
          variant={rank === 0 ? "contained" : "outlined"}
          startIcon={<EventNoteOutlinedIcon />}
          onClick={() => onSelect(recipe)}
          disabled={loading}
        >
          Build prep plan
        </Button>
      </CardActions>
    </Card>
  );
}

/** Screen 2: AI-matched pantry + top ranked recipes with score breakdown. */
export default function RecipesScreen({
  hasSearched,
  matchedPantry,
  recipes,
  noMatchReason,
  servings,
  setServings,
  onSelect,
  onGoPantry,
  loading,
}) {
  if (!hasSearched) {
    return (
      <EmptyState
        Icon={RestaurantMenuIcon}
        title="Find your next meal"
        body="Tell Bread what's in your kitchen and it'll rank recipes that fit your time and equipment."
        actionLabel="Go to pantry"
        onAction={onGoPantry}
      />
    );
  }

  return (
    <>
      {matchedPantry.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Matched from your pantry
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {matchedPantry.map((item) => (
              <Chip
                key={`${item.raw}-${item.normalized_id}`}
                variant="outlined"
                label={`${item.raw} → ${prettyLabel(item.normalized_id)} · ${Math.round(item.confidence * 100)}%`}
              />
            ))}
          </Box>
        </Box>
      )}

      <Card sx={{ mb: 2, px: 2, py: 1 }}>
        <Stack direction="row" sx={{ alignItems: "center" }}>
          <Typography sx={{ flex: 1 }}>Servings</Typography>
          <IconButton
            aria-label="Fewer servings"
            onClick={() => setServings(Math.max(1, servings - 1))}
            disabled={servings <= 1}
          >
            <RemoveIcon />
          </IconButton>
          <Typography sx={{ minWidth: 32, textAlign: "center", fontWeight: 500 }} aria-live="polite">
            {servings}
          </Typography>
          <IconButton
            aria-label="More servings"
            onClick={() => setServings(Math.min(12, servings + 1))}
          >
            <AddIcon />
          </IconButton>
        </Stack>
      </Card>

      {recipes.length > 0 ? (
        recipes.map((recipe, i) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            rank={i}
            servings={servings}
            onSelect={onSelect}
            loading={loading}
          />
        ))
      ) : (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={onGoPantry}>
              Edit pantry
            </Button>
          }
        >
          {noMatchReason || "No recipes matched your pantry and constraints."}
        </Alert>
      )}
    </>
  );
}
