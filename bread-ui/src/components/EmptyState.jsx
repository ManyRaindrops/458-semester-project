import { Box, Button, Typography } from "@mui/material";

/** Friendly placeholder for tabs that have nothing to show yet. */
export default function EmptyState({ Icon, title, body, actionLabel, onAction }) {
  return (
    <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          mx: "auto",
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "primaryContainer.main",
          color: "primaryContainer.contrastText",
        }}
      >
        <Icon sx={{ fontSize: 36 }} />
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {body}
      </Typography>
      {actionLabel && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
