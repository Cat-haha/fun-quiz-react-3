import * as React from "react";
import "./styles.css";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import questions from "./questions.js";

export default function TemporaryDrawer({ setqIndex, alreadyAnsweredArray }) {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const goToQuestion = (num) => {
    setqIndex(num);
  };

  const DrawerList = (
    <Box sx={{ width: 300 }} role="presentation">
      <List>
        {questions
          .filter((_, index) => !alreadyAnsweredArray.includes(index))
          .map((item, index) => {
            const originalIndex = questions.indexOf(item);
            return (
              <ListItem key={originalIndex} disablePadding>
                <ListItemButton onClick={() => goToQuestion(originalIndex)}>
                  <ListItemText
                    primary={originalIndex + 1}
                    className="sidebar"
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>
    </Box>
  );

  return (
    <div>
      <button onClick={toggleDrawer(true)}>Open drawer</button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}
