import { useEffect, useState } from "react";
import { addMonths, format, addDays } from "date-fns";
import { Table, Box, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Paper } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/holiday.css"
import { Button, DatePicker, Input, Modal, Select, Tooltip } from "antd";
import { SaveOutlined, DeleteOutlined, EditOutlined } from "@mui/icons-material";
const moduleOptions = ["Land Acquisition", "Forest Clearance", "Budget Planning"];
import { db } from "../Utils/dataStorege.ts";
import dayjs from "dayjs";
import { notify } from "../Utils/ToastNotify.tsx";
import { getCurrentUser } from "../Utils/moduleStorage.ts";

export const HolidayCalender = () => {
  const [rows, setRows] = useState<any>([
    {
      from: null, to: null, holiday: "", module: [], impact: {}, editing: true, projectId: null
    },
  ]);
  const [, setBaseMonth] = useState(new Date());
  const tableHeaders = ["From Date", "To Date", "Holiday", "Modules", "Impact", "Actions"];
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const holidayDates = rows.filter((row: any) => !row.editing && row.from && row.to)
    .flatMap((row: any) => {
      const start: any = new Date(row.from);
      const end: any = new Date(row.to);
      const dates = [];
      let current = start;
      while (current <= end) {
        dates.push(format(current, 'yyyy-MM-dd'));
        current = addDays(current, 1);
      }
      return dates;
    });

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.orgId) {
      fetchHolidays();
    }
  }, [currentUser]);
  // const activeEditIndex = rows.findIndex((row: any) => row.editing);

  const fetchHolidays = async () => {
    try {
      const holidays = await db.getAllHolidays();
      if (holidays && currentUser?.orgId) {
        const globalHolidays = holidays.filter(
          (row: any) => !row.projectId && row.orgId == currentUser.orgId
        );

        const updatedRows = globalHolidays.map((row: any) => ({
          ...row,
          from: row.from && typeof row.from == "object" && "$d" in row.from
            ? dayjs(row.from.$d)
            : dayjs(row.from),
          to: row.to && typeof row.to == "object" && "$d" in row.to
            ? dayjs(row.to.$d)
            : dayjs(row.to),
        }));

        setRows(updatedRows);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const handleLowerCalendarNavigation = (activeStartDate: any) => {
    setBaseMonth(addMonths(activeStartDate, -1));
  };

  const handleUpperCalendarNavigation = (activeStartDate: any) => {
    setBaseMonth(activeStartDate);
  };

  const handleInputChange = (index: number, field: string, value: string[]) => {
    const updatedRows: any = [...rows];

    if (field == "module") {
      let selectedModules = value;

      updatedRows[index][field] = selectedModules;

      const impact: Record<string, string> = {};
      if (selectedModules.includes("all")) {
        impact["all"] = "100";
      } else if (selectedModules.length > 0) {
        const dividedImpact: any = 100;
        selectedModules.forEach((module) => {
          impact[module] = dividedImpact;
        });
      }

      updatedRows[index].impact = impact;
    } else {
      updatedRows[index][field] = value;
    }

    setRows(updatedRows);
  };

  const handleImpactChange = (index: any, module: any, value: any) => {
    const updatedRows: any = [...rows];
    updatedRows[index].impact[module] = value;
    setRows(updatedRows);
  };

  const toggleEdit = (index: number) => {
    setEditMode(true);
    // activeEditIndex(index);
    const updatedRows = [...rows];
    updatedRows[index].editing = !updatedRows[index].editing;
    setRows(updatedRows);
  };


  const addRow = () => {
    setRows([
      ...rows,
      { from: null, to: null, holiday: "", module: [], impact: {}, editing: true },
    ]);
  };

  const showDeleteModal = (index: number) => {
    setDeleteIndex(index);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      deleteRow(deleteIndex);
    }
    setDeleteModalVisible(false);
    setDeleteIndex(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setDeleteIndex(null);
  };

  const deleteRow = async (index: number) => {
    try {
      const rowToDelete: any = rows[index];

      if (rowToDelete?.id) {
        await db.deleteHolidays(rowToDelete.id);
      }

      setRows((prevRows: any) => prevRows.filter((_: any, i: any) => i !== index));
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  const saveChanges = async (rowdata: any, index: number) => {
    try {
      const row: any = rows[index];
      let currentUser = getCurrentUser();
      if (!row.from || !row.to || !row.holiday.trim() || row.module.length == 0) {
        notify.error("Please fill all required fields before saving.");
        return;
      }

      if (!row.id) {
        row.id = Date.now();
        row.userGuiId = currentUser?.guiId;
        row.orgId = currentUser?.orgId;
        row.createdAt = new Date().toISOString();
        row.projectId = null
      }

      const updatedRows = [...rows];
      updatedRows[index].editing = false;
      setRows(updatedRows);
      !editMode ? await db.addHolidays(row as any) : await db.updateHolidays(rowdata.id, rowdata);
      setEditMode(false);
      // activeEditIndex(null);

    } catch (error) {
      notify.error("Failed to save holiday. Please try again.");
    }
  };

  const toggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  const handleCalendarDateClick = (date: Date) => {
    const index = rows.findIndex((row: any) => row.editing);
    if (index == -1) return;

    const selectedDate = dayjs(date);

    if (selectedDate.isBefore(dayjs().startOf("day"))) return;

    const updatedRows = [...rows];
    const row = updatedRows[index];

    if (!row.from) {
      row.from = selectedDate;
    } else if (!row.to) {
      if (selectedDate.isAfter(row.from) || selectedDate.isSame(row.from, "day")) {
        row.to = selectedDate;
      } else {
        row.from = selectedDate;
        row.to = null;
      }
    } else {
      row.from = selectedDate;
      row.to = null;
    }

    setRows(updatedRows);
  };

  const calendarTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    const isHoliday = holidayDates.includes(formattedDate);

    let isSelectedRange = false;

    const editingRow = rows.find((row: any) => row.editing);
    if (editingRow?.from) {
      const from = dayjs(editingRow.from);
      const to = dayjs(editingRow.to ?? editingRow.from);
      const current = dayjs(date);
      isSelectedRange =
        current.isSame(from, "day") ||
        current.isSame(to, "day") ||
        (current.isAfter(from) && current.isBefore(to));
    }

    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "2px" }}>
        <div
          style={{
            backgroundColor: isSelectedRange
              ? "#1890ff"
              : isHoliday
                ? "#ff4d4d"
                : undefined,
            borderRadius: "50%",
            width: "8px",
            height: "8px",
          }}
        />
      </div>
    );
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper style={{ display: "flex" }} className="main-container-div" elevation={0}>
        <Box className="left-part" style={{
          width: showCalendar ? "75%" : "98.8%",
          transition: "width 0.5s ease-in-out",
          overflow: "hidden",
        }}>
          <Box className="card-header-items">
            <div className="holiday-page-heading">
              Holiday Calendar
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                className="aad-btn bg-secondary"
                onClick={addRow}
                style={{ padding: "0px 10px" }}
              >
                Add New Holiday
              </Button>
              <Button
                className="toggle-calendar-btn bg-tertiary"
                onClick={toggleCalendar}
                color="primary"
              >
                {showCalendar ? "Hide Calendar" : "Show Calendar"}
              </Button>
            </div>

          </Box>

          <TableContainer className="table-items">
            <Table stickyHeader>
              <TableHead
                className="bg-secondary"
                sx={{ position: "sticky", top: 0, zIndex: 2, backgroundColor: "#257180" }}
              >
                <TableRow className="table-header">
                  {tableHeaders.map((header) => (
                    <TableCell
                      key={header}
                      className="table-cell"
                      sx={{ backgroundColor: "#257180", color: "white", fontWeight: "bold", textTransform: "none" }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              {/* <TableBody>
                {rows.map((row: any, index: any) => (
                  <TableRow key={index}>
                    <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                      <DatePicker
                        value={row.from}
                        onChange={(date) => handleInputChange(index, "from", date as any)}
                        disabled={!row.editing}
                        disabledDate={(current: any) =>
                          current
                            ? current.isBefore(dayjs().startOf("day")) || (row.to && current.isAfter(dayjs(row.to)))
                            : false
                        }
                      />
                    </TableCell>

                    <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                      <DatePicker
                        value={row.to}
                        onChange={(date) => handleInputChange(index, "to", date as any)}
                        disabled={!row.editing}
                        style={{ width: "100%" }}
                        disabledDate={(current: any) =>
                          current
                            ? current.isBefore(dayjs().startOf("day")) || (row.from && current.isBefore(dayjs(row.from)))
                            : false
                        }
                      />
                    </TableCell>

                    <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                      <Input
                        value={row.holiday}
                        onChange={(e) => handleInputChange(index, "holiday", e.target.value as any)}
                        placeholder="Enter holiday name"
                        disabled={!row.editing}
                      />
                    </TableCell>

                    <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                      {row.editing ? (
                        <Select
                          mode="multiple"
                          value={row.module}
                          onChange={(value: any) => handleInputChange(index, "module", value)}
                          style={{ width: "180px" }}
                        >
                          <Select.Option key="all" value="all">
                            Select All
                          </Select.Option>
                          {moduleOptions.map((module) => (
                            <Select.Option key={module} value={module}>
                              {module}
                            </Select.Option>
                          ))}
                        </Select>
                      ) : (
                        <Box>
                          {Array.isArray(row.module) ? (
                            row.module.map((module: any) => (
                              <Typography key={module} variant="body2">
                                {module}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2">{row.module}</Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                      <Box sx={{ display: "flex", gap: "5px", flexWrap: "wrap", flexDirection: "column", justifyContent: "center" }}>
                        {Object.entries(row.impact)?.map(([module, impact]) => (
                          <Box key={module} sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                            {row.editing ? (
                              <TextField
                                value={impact}
                                onChange={(e) => handleImpactChange(index, module, e.target.value)}
                                size="small"
                                sx={{ width: "60px" }}
                              />
                            ) : (
                              <Typography variant="body2">{impact !== undefined ? `${impact}%` : "N/A"}</Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ textAlign: "center", display: "flex", gap: "10px", justifyContent: "center", borderBottom: "0px" }}>
                      {row.editing ? (
                        <>
                          <Tooltip title="Delete">
                            <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} onClick={() => showDeleteModal(index)} />
                          </Tooltip>
                          <Tooltip title="Save">
                            <Button type="primary" shape="circle" icon={<SaveOutlined />} onClick={() => saveChanges(row, index)} />
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Edit">
                          <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => toggleEdit(index)} />
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody> */}
              <TableBody>
                {rows.length === 0 || rows.every((row: any) =>
                  !row.editing && !row.from && !row.to && !row.holiday && (!row.module || row.module.length === 0)
                ) ? (
                  <TableRow>
                    <TableCell colSpan={tableHeaders.length} style={{ textAlign: "center", padding: "30px" }}>
                      <Typography variant="body1" color="textSecondary">
                        No holiday data available.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row: any, index: any) => (
                    <TableRow key={index}>
                      <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                        <DatePicker
                          value={row.from}
                          onChange={(date) => handleInputChange(index, "from", date as any)}
                          disabled={!row.editing}
                          disabledDate={(current: any) =>
                            current
                              ? current.isBefore(dayjs().startOf("day")) || (row.to && current.isAfter(dayjs(row.to)))
                              : false
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                        <DatePicker
                          value={row.to}
                          onChange={(date) => handleInputChange(index, "to", date as any)}
                          disabled={!row.editing}
                          style={{ width: "100%" }}
                          disabledDate={(current: any) =>
                            current
                              ? current.isBefore(dayjs().startOf("day")) || (row.from && current.isBefore(dayjs(row.from)))
                              : false
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                        <Input
                          value={row.holiday}
                          onChange={(e) => handleInputChange(index, "holiday", e.target.value as any)}
                          placeholder="Enter holiday name"
                          disabled={!row.editing}
                        />
                      </TableCell>

                      <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                        {row.editing ? (
                          <Select
                            mode="multiple"
                            value={row.module}
                            onChange={(value: any) => handleInputChange(index, "module", value)}
                            style={{ width: "180px" }}
                          >
                            <Select.Option key="all" value="all">
                              Select All
                            </Select.Option>
                            {moduleOptions.map((module) => (
                              <Select.Option key={module} value={module}>
                                {module}
                              </Select.Option>
                            ))}
                          </Select>
                        ) : (
                          <Box>
                            {Array.isArray(row.module) ? (
                              row.module.map((module: any) => (
                                <Typography key={module} variant="body2">
                                  {module}
                                </Typography>
                              ))
                            ) : (
                              <Typography variant="body2">{row.module}</Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>

                      <TableCell sx={{ textAlign: "center", padding: "5px" }}>
                        <Box sx={{ display: "flex", gap: "5px", flexWrap: "wrap", flexDirection: "column", justifyContent: "center" }}>
                          {Object.entries(row.impact)?.map(([module, impact]) => (
                            <Box key={module} sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                              {row.editing ? (
                                <TextField
                                  value={impact}
                                  onChange={(e) => handleImpactChange(index, module, e.target.value)}
                                  size="small"
                                  sx={{ width: "60px" }}
                                />
                              ) : (
                                <Typography variant="body2">{impact !== undefined ? `${impact}%` : "N/A"}</Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ textAlign: "center", display: "flex", gap: "10px", justifyContent: "center", borderBottom: "0px" }}>
                        {row.editing ? (
                          <>
                            <Tooltip title="Delete">
                              <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} onClick={() => showDeleteModal(index)} />
                            </Tooltip>
                            <Tooltip title="Save">
                              <Button type="primary" shape="circle" icon={<SaveOutlined />} onClick={() => saveChanges(row, index)} />
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Edit">
                            <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => toggleEdit(index)} />
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {showCalendar && (
          <Box
            className="right-part"
            style={{
              width: "35%",
              padding: "10px",
              borderRadius: "5px",
              display: "grid",
              gridTemplateColumns: "repeat(1, 1fr)",
              gap: "10px",
            }}
          >
            {Array.from({ length: 12 }).map((_, monthIndex) => {
              const monthDate = dayjs().month(monthIndex).startOf("month").toDate();

              return (
                <Calendar
                  key={monthIndex}
                  value={monthDate}
                  activeStartDate={monthDate}
                  onActiveStartDateChange={({ activeStartDate }) =>
                    handleUpperCalendarNavigation
                      ? handleUpperCalendarNavigation(activeStartDate)
                      : handleLowerCalendarNavigation(activeStartDate)
                  }
                  view="month"
                  tileContent={calendarTileContent}
                  onClickDay={handleCalendarDateClick}
                  tileDisabled={({ date }) => dayjs(date).isBefore(dayjs().startOf("day"))}
                />
              );
            })}
          </Box>
        )}
        <Modal
          title="Confirm Deletion"
          visible={isDeleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          okText="Delete"
          okType="danger"
          cancelText="Cancel"
          className="modal-container"
        >
          <div style={{ padding: "0px 10px"}}>
          <p>Are you sure you want to delete this row?</p>
          </div>
        </Modal>

      </Paper>
    </LocalizationProvider>
  );
};