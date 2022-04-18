import { Alert, Dimensions, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { Fragment, useEffect, useState } from 'react';
import * as Calendar from 'expo-calendar';
import * as Localization from 'expo-localization';
import Icon from 'react-native-ico-material-design';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Task } from '../../components';
import { useStore } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';

var iconHeight = 26;
var iconWidth = 26;

const datesWhitelist = [
  {
    start: moment(),
    end: moment().add(365, 'days')
  }
];

export default function Home({ navigation }) {
  const handleDeletePreviousDayTask = async (oldTodo) => {
    try {
      if (oldTodo !== []) {
        const todayDate = `${moment().format('YYYY')}-${moment().format(
          'MM'
        )}-${moment().format('DD')}`;
        const checkDate = moment(todayDate);
        await oldTodo.filter((item) => {
          const currDate = moment(item.date);
          const checkedDate = checkDate.diff(currDate, 'days');
          if (checkedDate > 0) {
            item.todoList.forEach(async (listValue) => {
              try {
                await Calendar.deleteEventAsync(
                  listValue.alarm.createEventAsyncRes.toString()
                );
              } catch (error) {
                console.log(error);
              }
            });
            return false;
          }
          return true;
        });

        updateCurrentTask(currentDate);
      }
    } catch (error) {
    }
  };

  const { updateSelectedTask, deleteSelectedTask, todo } = useStore(
    (state) => ({
      updateSelectedTask: state.updateSelectedTask,
      deleteSelectedTask: state.deleteSelectedTask,
      todo: state.todo
    })
  );

  const [todoList, setTodoList] = useState([]);
  const [markedDate, setMarkedDate] = useState([]);
  const [currentDate, setCurrentDate] = useState(
    `${moment().format('YYYY')}-${moment().format('MM')}-${moment().format(
      'DD'
    )}`
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDateTimePickerVisible, setDateTimePickerVisible] = useState(false);

  useEffect(() => {
    handleDeletePreviousDayTask(todo);
  }, [todo, currentDate]);

  const handleModalVisible = () => {
    setModalVisible(!isModalVisible);
  };

  const updateCurrentTask = async (currentDate) => {
    try {
      if (todo !== [] && todo) {
        const markDot = todo.map((item) => item.markedDot);
        const todoLists = todo.filter((item) => {
          if (currentDate === item.date) {
            return true;
          }
          return false;
        });
        setMarkedDate(markDot);
        if (todoLists.length !== 0) {
          setTodoList(todoLists[0].todoList);
        } else {
          setTodoList([]);
        }
      }
    } catch (error) {
      console.log('updateCurrentTask', error.message);
    }
  };

  const showDateTimePicker = () => setDateTimePickerVisible(true);

  const hideDateTimePicker = () => setDateTimePickerVisible(false);

  const handleDatePicked = (date) => {
    let prevSelectedTask = JSON.parse(JSON.stringify(selectedTask));
    const selectedDatePicked = prevSelectedTask.alarm.time;
    const hour = moment(date).hour();
    const minute = moment(date).minute();
    let newModifiedDay = moment(selectedDatePicked).hour(hour).minute(minute);
    prevSelectedTask.alarm.time = newModifiedDay;
    setSelectedTask(prevSelectedTask);
    hideDateTimePicker();
  };

  const handleAlarmSet = () => {
    let prevSelectedTask = JSON.parse(JSON.stringify(selectedTask));
    prevSelectedTask.alarm.isOn = !prevSelectedTask.alarm.isOn;
    setSelectedTask(prevSelectedTask);
  };

  const updateAlarm = async () => {
    const calendarId = await createNewCalendar();
    const event = {
      title: selectedTask.title,
      notes: selectedTask.notes,
      startDate: moment(selectedTask?.alarm.time).add(0, 'm').toDate(),
      endDate: moment(selectedTask?.alarm.time).add(5, 'm').toDate(),
      timeZone: Localization.timezone
    };

    if (!selectedTask?.alarm.createEventAsyncRes) {
      try {
        const createEventAsyncRes = await Calendar.createEventAsync(
          calendarId.toString(),
          event
        );
        let updateTask = JSON.parse(JSON.stringify(selectedTask));
        updateTask.alarm.createEventAsyncRes = createEventAsyncRes;
        setSelectedTask(updateTask);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await Calendar.updateEventAsync(
          selectedTask?.alarm.createEventAsyncRes.toString(),
          event
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const deleteAlarm = async () => {
    try {
      if (selectedTask?.alarm.createEventAsyncRes) {
        await Calendar.deleteEventAsync(
          selectedTask?.alarm.createEventAsyncRes
        );
      }
      let updateTask = JSON.parse(JSON.stringify(selectedTask));
      updateTask.alarm.createEventAsyncRes = '';
      setSelectedTask(updateTask);
    } catch (error) {
      console.log('deleteAlarm', error.message);
    }
  };

  const getEvent = async () => {
    if (selectedTask?.alarm.createEventAsyncRes) {
      try {
        await Calendar.getEventAsync(
          selectedTask?.alarm.createEventAsyncRes.toString()
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const createNewCalendar = async () => {
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await Calendar.getDefaultCalendarAsync(Calendar.EntityTypes.EVENT)
        : { isLocalAccount: true, name: 'Google Calendar' };

    const newCalendar = {
      title: 'Personal',
      entityType: Calendar.EntityTypes.EVENT,
      color: '#2196F3',
      sourceId: defaultCalendarSource?.sourceId || undefined,
      source: defaultCalendarSource,
      name: 'internal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
      ownerAccount: 'personal'
    };

    let calendarId = null;

    try {
      calendarId = await Calendar.createCalendarAsync(newCalendar);
    } catch (e) {
      Alert.alert(e.message);
    }

    return calendarId;
  }; 

  return (
    <Fragment>
      <View style={{ alignItems: 'center', backgroundColor: '#000000' }}>
        <View style={{flexDirection: 'row'}}>
          <Icon name="list-of-three-elements-on-black-background" height={iconHeight + 4} width={iconWidth + 4} color='#FFFFFF' marginTop={18} marginRight={3} />
          <Text style={{ fontSize: 30, padding: 10, color: '#FFFFFF', fontWeight: 'bold' }}>
            TO DO LIST
          </Text>
        </View>
        <View style={{ borderTopWidth: 2, borderColor: '#FFFFFF', width: '85%', paddingBottom: 20 }}></View>
      </View>
      {selectedTask !== null && (
        <Task {...{ setModalVisible, isModalVisible }}>
          <DateTimePicker
            isVisible={isDateTimePickerVisible}
            onConfirm={handleDatePicked}
            onCancel={hideDateTimePicker}
            mode="time"
            date={new Date()}
            isDarkModeEnabled
          />
          <View style={styles.taskContainer}>
            <View>
              <Text
                style={{
                  color: '#9CAAC4',
                  fontSize: 16,
                  fontWeight: '600'
                }}
              >
                Judul
              </Text>
            </View>
            <TextInput
              style={styles.title}
              onChangeText={(text) => {
                let prevSelectedTask = JSON.parse(JSON.stringify(selectedTask));
                prevSelectedTask.title = text;
                setSelectedTask(prevSelectedTask);
              }}
              value={selectedTask.title}
              placeholder="Judul"
            />
            <View style={styles.notesContent} />
            <View>
              <Text
                style={{
                  color: '#9CAAC4',
                  fontSize: 16,
                  fontWeight: '600'
                }}
              >
                Catatan :
              </Text>
              <TextInput
                style={{
                  height: 25,
                  fontSize: 19,
                  marginTop: 3
                }}
                onChangeText={(text) => {
                  let prevSelectedTask = JSON.parse(
                    JSON.stringify(selectedTask)
                  );
                  prevSelectedTask.notes = text;
                  setSelectedTask(prevSelectedTask);
                }}
                value={selectedTask.notes}
              />
            </View>
            <View style={styles.separator} />
            <View>
              <Text
                style={{
                  color: '#9CAAC4',
                  fontSize: 16,
                  fontWeight: '600'
                }}
              >
                Waktu
              </Text>
              <TouchableOpacity
                onPress={() => showDateTimePicker()}
                style={{
                  height: 25,
                  marginTop: 3
                }}
              >
                <Text style={{ fontSize: 19 }}>
                  {moment(selectedTask?.alarm?.time || moment()).format(
                    'h:mm A'
                  )}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.separator} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <View>
                <Text
                  style={{
                    color: '#9CAAC4',
                    fontSize: 16,
                    fontWeight: '600'
                  }}
                >
                  Status Pengingat
                </Text>
              </View>
              <Switch
                value={selectedTask?.alarm?.isOn || false}
                onValueChange={handleAlarmSet}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                onPress={async () => {
                  handleModalVisible();
                  console.log('isOn', selectedTask?.alarm.isOn);
                  if (selectedTask?.alarm.isOn) {
                    await updateAlarm();
                  } else {
                    await deleteAlarm();
                  }
                  await updateSelectedTask({
                    date: currentDate,
                    todo: selectedTask
                  });
                  updateCurrentTask(currentDate);
                }}
                style={styles.updateButton}
              >
                <Icon name="check-symbol" height={iconHeight + 5} width={iconWidth + 5} color='white' />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  handleModalVisible();
                  deleteAlarm();
                  await deleteSelectedTask({
                    date: currentDate,
                    todo: selectedTask
                  });
                  updateCurrentTask(currentDate);
                }}
                style={styles.deleteButton}
              >
                <Icon name="rubbish-bin-delete-button" height={iconHeight + 5} width={iconWidth + 5} color='white' />
              </TouchableOpacity>
            </View>
          </View>
        </Task>
      )}
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#000000'
        }}
      >
        <CalendarStrip
          calendarAnimation={{ type: 'sequence', duration: 30 }}
          daySelectionAnimation={{
            type: 'background',
            duration: 200
          }}
          style={{
            height: 150,
            paddingTop: 20,
            paddingBottom: 20
          }}
          calendarHeaderStyle={{ color: '#FFFFFF' }}
          dateNumberStyle={{ color: '#FFFFFF', paddingTop: 10 }}
          dateNameStyle={{ color: '#BBBBBB' }}
          highlightDateNumberStyle={{
            color: '#fff',
            backgroundColor: '#2E66E7',
            marginTop: 10,
            height: 35,
            width: 35,
            textAlign: 'center',
            borderRadius: 17.5,
            overflow: 'hidden',
            paddingTop: 6,
            fontWeight: '400',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          highlightDateNameStyle={{ color: '#2E66E7' }}
          disabledDateNameStyle={{ color: '#f7f7f7' }}
          disabledDateNumberStyle={{ color: '#f7f7f7', paddingTop: 10 }}
          datesWhitelist={datesWhitelist}
          iconLeft={require('../../../assets/left-arrow.png')}
          iconRight={require('../../../assets/right-arrow.png')}
          iconContainer={{ flex: 0.1 }}
          markedDates={markedDate}
          selectedDate={currentDate}
          onDateSelected={(date) => {
            const selectedDate = `${moment(date).format('YYYY')}-${moment(
              date
            ).format('MM')}-${moment(date).format('DD')}`;
            updateCurrentTask(selectedDate);
            setCurrentDate(selectedDate);
          }}
        />
        <View style={{ alignItems: 'center', paddingTop: 30 }}>
          <View style={{ borderTopWidth: 2, borderColor: '#FFFFFF', width: '85%', paddingBottom: 20 }}></View>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CreateTask', {
              updateCurrentTask: updateCurrentTask,
              currentDate,
              createNewCalendar: createNewCalendar
            })
          }
          style={styles.viewTask}
        >
          <Icon name="add-plus-button" height={40} width={40}/>
        </TouchableOpacity>
        <View
          style={{
            width: '100%',
            height: Dimensions.get('window').height - 170
          }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 20
            }}
          >
            {todoList.map((item) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedTask(item);
                  setModalVisible(true);
                  getEvent();
                }}
                key={item.key}
                style={styles.taskListContent}
              >
                <View
                  style={{
                    marginLeft: 20
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Icon name="add-label-button" height={iconHeight - 4} width={iconWidth - 4} color={item.color} marginRight={8} />
                    <Text
                      style={{
                        color: '#554A4C',
                        fontSize: 22,
                        fontWeight: '700'
                      }}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 30
                      }}
                    >
                      <Text
                        style={{
                          color: '#BBBBBB',
                          fontSize: 16,
                          marginRight: 5
                        }}
                      >{`${moment(item.alarm.time).format('YYYY')}/${moment(
                        item.alarm.time
                      ).format('MM')}/${moment(item.alarm.time).format(
                        'DD'
                      )}`}</Text>
                      <Text
                        style={{
                          color: '#BBBBBB',
                          fontSize: 16
                        }}
                      >
                        {item.notes}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  taskListContent: {
    height: 100,
    width: 327,
    alignSelf: 'center',
    borderRadius: 20,
    borderTopRightRadius: 50,
    shadowColor: '#404040',
    backgroundColor: '#ffffff',
    marginTop: 10,
    marginBottom: 10,
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 0.2,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  viewTask: {
    position: 'absolute',
    bottom: 40,
    right: 17,
    height: 60,
    width: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#404040',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 30,
    shadowOpacity: 0.5,
    elevation: 5,
    zIndex: 999
  },
  deleteButton: {
    backgroundColor: '#ff3333',
    width: 50,
    height: 50,
    alignSelf: 'center',
    marginTop: 40,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  updateButton: {
    backgroundColor: '#3341ff',
    width: 50,
    height: 50,
    alignSelf: 'center',
    marginTop: 40,
    borderRadius: 100,
    justifyContent: 'center',
    marginRight: 20,
    alignItems: 'center',
  },
  separator: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#979797',
    alignSelf: 'center',
    marginVertical: 20
  },
  notesContent: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#979797',
    alignSelf: 'center',
    marginVertical: 20
  },
  learn: {
    height: 23,
    width: 51,
    backgroundColor: '#F8D557',
    justifyContent: 'center',
    borderRadius: 5
  },
  design: {
    height: 23,
    width: 59,
    backgroundColor: '#62CCFB',
    justifyContent: 'center',
    borderRadius: 5,
    marginRight: 7
  },
  readBook: {
    height: 23,
    width: 83,
    backgroundColor: '#4CD565',
    justifyContent: 'center',
    borderRadius: 5,
    marginRight: 7
  },
  title: {
    height: 25,
    borderColor: '#5DD976',
    fontSize: 19
  },
  taskContainer: {
    height: 450,
    width: 327,
    alignSelf: 'center',
    borderRadius: 20,
    borderTopRightRadius: 70,
    borderBottomLeftRadius: 70,
    shadowColor: '#404040',
    backgroundColor: '#ffffff',
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowRadius: 20,
    shadowOpacity: 0.2,
    elevation: 5,
    padding: 22
  }
});
