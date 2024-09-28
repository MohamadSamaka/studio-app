import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, IconButton, Switch, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TimeInput from '../../../../components/common/TimeInput';

const BusinessDayCard = ({
  day,
  data,
  initialData,
  expandedDay,
  setExpandedDay,
  // setSelectedTimeInput,
  handleToggle,
  handleResetDay,
  handleAddBreak,
  handleRemoveBreak,
  showTimePicker,
}) => {
  const handleExpand = () => setExpandedDay(expandedDay === day ? null : day);

  return (
    <Card
      key={day}
      style={[styles.dayCard, !data.open && styles.closedDayCard, JSON.stringify(data) !== JSON.stringify(initialData) && styles.changedCard]}
      onPress={() => handleExpand(day)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrapper}>
          <View style={styles.cardTitle}>
            <Icon
              name={data.open ? "clock-outline" : "calendar-remove-outline"}
              size={24}
              color={data.open ? "#4a90e2" : "#ff6b6b"}
              style={styles.icon}
            />
            <Title style={styles.dayTitle}>{day}</Title>
          </View>
        </View>

        <View style={styles.actionsWrapper}>
          <Switch
            value={data.open}
            onValueChange={() => handleToggle(day)}
            color="#4a90e2"
            style={styles.switch}
          />
          <IconButton
            icon="restore"
            size={24}
            color="#4a90e2"
            onPress={() => handleResetDay(day)}
          />
        </View>
      </View>

      {expandedDay === day && data.open && (
        <View style={styles.expandableContent}>
          <TimeInput
            label="Open Time"
            value={data.open_time}
            onPress={() => showTimePicker(day, data.open_time, null, 'open_time')}
          />
          <TimeInput
            label="Close Time"
            value={data.close_time}
            onPress={() => showTimePicker(day, data.close_time, null, 'close_time',)}
          />

          <Title style={styles.breakTitle}>Break Times</Title>
          {data.breaks.map((breakTime, index) => (
            <View key={index} style={styles.breakContainer}>
              <TimeInput
                label="Start Time"
                value={breakTime.start_time}
                onPress={() => showTimePicker(day, breakTime.start_time, index, 'start_time')}
              />
              <TimeInput
                label="End Time"
                value={breakTime.end_time}
                onPress={() => showTimePicker(day, breakTime.end_time, index, 'end_time')}
              />
              <IconButton
                icon="delete"
                size={20}
                color="red"
                onPress={() => handleRemoveBreak(day, index)}
              />
            </View>
          ))}
          <Button icon="plus" mode="text" onPress={() => handleAddBreak(day)}>
            Add Break
          </Button>
        </View>
      )}

      {expandedDay === day && !data.open && (
        <View style={styles.closedDayMessage}>
          <Icon name="calendar-remove-outline" size={20} color="#ff6b6b" />
          <Title style={styles.closedText}>Closed</Title>
        </View>
      )}
    </Card>
  );
};


const styles = StyleSheet.create({
  dayCard: {
    width: '100%',
    marginVertical: 8,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  closedDayCard: {
    backgroundColor: '#f8d7da',
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  changedCard: {
    borderColor: '#ffa500',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleWrapper: {
    flex: 1,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    width: 100,
  },
  actionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    marginHorizontal: 10,
  },
  expandableContent: {
    marginTop: 10,
  },
  timeInput: {
    flex: 1,
  },
  breakTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  breakContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  closedDayMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  closedText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginLeft: 5,
  },
});
export default BusinessDayCard;
