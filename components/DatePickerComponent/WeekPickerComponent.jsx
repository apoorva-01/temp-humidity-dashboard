import React from "react";
import moment from "moment";
import clsx from "clsx";
import { DatePicker } from "@mui/lab";
import { IconButton } from "@mui/material";
import { createStyles, withStyles } from "@mui/styles";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

class WeekPicker extends React.Component {
  state = {
    selectedDate: new Date()
  };

  handleWeekChange = date => {
    this.setState({ selectedDate: date.startOf("isoWeek") });
  };

  formatWeekSelectLabel = (date, invalidLabel) => {
    let dateClone = date;

    return dateClone && dateClone.isValid()
      ? `Week of ${dateClone.startOf("isoWeek").format("MMM DD")}`
      : invalidLabel;
  };

  renderWrappedWeekDay = (date, selectedDate, dayInCurrentMonth) => {
    const { classes } = this.props;

    let dateClone = date.clone();
    let selectedDateClone = selectedDate.clone();

    const start = selectedDateClone.startOf("week").toDate();
    const end = selectedDateClone.endOf("week").toDate();

    const dayIsBetween = dateClone.isBetween(start, end, null, []);
    const isFirstDay = dateClone.isSame(start, "day");
    const isLastDay = dateClone.isSame(end, "day");

    const wrapperClassName = clsx({
      [classes.highlight]: dayIsBetween,
      [classes.firstHighlight]: isFirstDay,
      [classes.endHighlight]: isLastDay
    });

    const dayClassName = clsx(classes.day, {
      [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
      [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween
    });

    return (
      <div>
        <div className={wrapperClassName}>
          <IconButton className={dayClassName}>
            <span>{dateClone.format("DD")}</span>
          </IconButton>
        </div>
      </div>
    );
  };

  render() {
    const { selectedDate } = this.state;

    return (
      <DatePicker
        label="Week picker"
        value={selectedDate}
        onChange={this.handleWeekChange}
        renderDay={this.renderWrappedWeekDay}
        labelFunc={this.formatWeekSelectLabel}
      />
    );
  }
}

const styles = createStyles(theme => ({
  dayWrapper: {
    position: "relative"
  },
  day: {
    width: "36px",
    height: "36px",
    fontSize: "0.8rem",
    margin: "0 2px",
    color: "rgba(0, 0, 0, 0.87)"
  },
  customDayHighlight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "2px",
    right: "2px",
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: "50%"
  },
  nonCurrentMonthDay: {
    color: theme.palette.text.disabled
  },
  highlightNonCurrentMonthDay: {
    color: "#676767"
  },
  highlight: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white
  },
  endHighlight: {
    extend: "highlight",
    borderTopRightRadius: "50%",
    borderBottomRightRadius: "50%"
  },
  firstHighlight: {
    extend: "highlight",
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%"
  },
  display: {
    display: "flex",
    justifyContent: "space-around"
  },
  today: {
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    fontWeight: "bold",
    "&:hover": {
      background: theme.palette.primary.light
    }
  },
  selected: {
    background: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`,
    fontWeight: "bold",
    "&:hover": {
      background: theme.palette.primary.light
    }
  }
}));

export default withStyles(styles)(WeekPicker);
