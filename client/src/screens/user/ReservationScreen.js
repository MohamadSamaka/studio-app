import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import AppBar from '../../components/common/AppBar';
import CustomAlert from '../../components/common/CustomAlert';
import CalendarHeader from '../../components/client/reservration/CalendarHeader'
import TimeSlot from '../../components/client/reservration/TimeSlot';
import ReservationModal from '../../components/client/reservration/ReservationModal';
import BookingModal from '../../components/client/reservration/BookingModal';
import { generateTimeSlots } from '../../utils/timeSlots';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUserContext } from '../../contexts/UserContext';
import { useConfigContext } from '../../contexts/ConfigContext';
import { 
  getBusinessCalender,
  createReservation,
  getOrganizedReservationsByDateAndTime
 } from '../../utils/axios'
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { theme } from '../../utils/theme'

const CustomReservationCalendar = () => {
  const { config, loading: configLoading } = useConfigContext();
  const { t } = useTranslation(); // Initialize translation function
  const { credits, updateCredits } = useUserContext();
  const { user, loading: authLoading } = useAuthContext();
  const [reservations, setReservations] = useState([]);
  // const { reservations, setReservations, fetchReservations, loading: reservationsLoading } = useReservations();

  const [maxUsersPerSlot, setMaxUsersPerSlot] = useState(null);
  const [slotDuration, setSlotDuration] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [businessHours, setBusinessHours] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [displayedDates, setDisplayedDates] = useState([moment().format('YYYY-MM-DD')]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));
  const scrollViewRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [dateLayouts, setDateLayouts] = useState({});
  const [userBookings, setUserBookings] = useState({});
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmAction: null,
  });

  const minDate = moment().startOf('month').format('YYYY-MM-DD');
  const maxDate = moment().add(3, 'months').endOf('month').format('YYYY-MM-DD');

  // Update config-based settings
  useEffect(() => {
    if (config && config.reservations) {
      setMaxUsersPerSlot(config.reservations['max-users-per-reservation']);
      setSlotDuration(config.reservations['timeslots-duration']);
    }
  }, [config]);

  // Fetch business days and reservations when user or month changes
  // useEffect(() => {
  //   if (!authLoading && user) {
  //     fetchBusinessDays();
  //     fetchReservations();
  //   }
  // }, [currentMonth, user, authLoading]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchBusinessDays();
      fetchReservations();
    }
    setSelectedDate(null)
  }, [currentMonth, user, authLoading]);

  const fetchReservations = async () => {
    try {
      const response = await getOrganizedReservationsByDateAndTime();
      const reservationsData = response.data;
      setReservations(reservationsData);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const fetchBusinessDays = async () => {
    setCalendarLoading(true);
    try {
      const response = await getBusinessCalender();
      const businessHoursData = response.data;
      const hoursByDay = {};

      businessHoursData.forEach((item) => {
        const dayOfWeek = item.day;

        if (dayOfWeek) {
          hoursByDay[dayOfWeek] = {
            fullyClosed: item.fully_closed || false,
            openTime: item.open_time || null,
            closeTime: item.close_time || null,
            breaks: Array.isArray(item.breaks)
              ? item.breaks.map((breakItem) => ({
                start: breakItem.start_time,
                end: breakItem.end_time,
              }))
              : [],
            exceptions: Array.isArray(item.exceptions)
              ? item.exceptions.map((exception) => ({
                exceptionDate: exception.exceptionDate,
                fully_closed: exception.fully_closed,
                open_time: exception.open_time || null,
                close_time: exception.close_time || null,
                exceptionsBreaks: Array.isArray(exception['exceptions-breaks'])
                  ? exception['exceptions-breaks'].map((breakItem) => ({
                    start: breakItem.start_time,
                    end: breakItem.end_time,
                  }))
                  : [],
              }))
              : [],
          };
        } else {
          console.error('Day of the week is undefined:', item);
        }
      });

      setBusinessHours(hoursByDay);
      const disabledDates = getDisabledDates(hoursByDay);
      setMarkedDates(disabledDates);
    } catch (error) {
      console.error('Error fetching business hours:', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  const getDisabledDates = (hoursByDay) => {
    const marked = {};
    const today = moment().startOf('day');

    for (let monthOffset = 0; monthOffset <= 3; monthOffset++) {
      const targetMonth = moment().add(monthOffset, 'months');
      const daysInMonth = targetMonth.daysInMonth();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = moment(`${targetMonth.year()}-${targetMonth.month() + 1}-${day}`, 'YYYY-MM-DD');
        const dayOfWeek = date.format('dddd');

        // Disable past dates
        if (date.isBefore(today)) {
          marked[date.format('YYYY-MM-DD')] = {
            disabled: true,
            disableTouchEvent: true,
          };
          continue;
        }

        const businessDay = hoursByDay[dayOfWeek];
        if (!businessDay) {
          marked[date.format('YYYY-MM-DD')] = {
            disabled: true,
            disableTouchEvent: true,
          };
        } else {
          const exception = businessDay.exceptions.find(
            (ex) => ex.exceptionDate === date.format('YYYY-MM-DD')
          );
          if (exception && exception.fully_closed) {
            marked[exception.exceptionDate] = {
              disabled: true,
              disableTouchEvent: true,
            };
          }
        }
      }
    }
    return marked;
  };

  const handleDateLayout = (date) => (event) => {
    const { y, height } = event.nativeEvent.layout;
    setDateLayouts((prevLayouts) => ({
      ...prevLayouts,
      [date]: { y, height },
    }));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
    setDisplayedDates([date.dateString]);

    if (scrollViewRef.current)
      scrollViewRef.current.scrollTo({ y: 0, animated: true });

    scrollY.setValue(0);
  };

  const handleReservation = async (time, date) => {
    const userName = user?.username || 'Unknown User';
    const currentReservations = reservations[date]?.[time] || [];


    // Check if the user has already booked this slot locally
    if (userBookings[date] === time || currentReservations.includes(userName)) {
      setAlertState({
        visible: true,
        title: t('reservationScreen.alreadyBooked'),
        message: t('reservationScreen.alreadyBookedMessage', { date, time }),
        type: 'info',
        confirmAction: null,
      });
      return;
    }

    if (credits - 1 < 0) {
      setAlertState({
        visible: true,
        title: t('reservationScreen.insufficientCredits'),
        message: t('reservationScreen.insufficientCreditsMessage'),
        type: 'error',
        confirmAction: null,
      });
      return;
    }

    // Check if the number of reservations is 6 or more
    if (currentReservations.length >= maxUsersPerSlot) {
      setAlertState({
        visible: true,
        title: t('reservationScreen.fullyBooked'),
        message: t('reservationScreen.fullyBookedMessage', { date, time }),
        type: 'alert',
        confirmAction: null,
      });
      return;
    }

    // Proceed with the reservation
    setAlertState({
      visible: true,
      title: t('reservationScreen.confirmReservation'),
      message: t('reservationScreen.confirmReservationMessage', { date, time }),
      type: 'confirm',
      confirmAction: async () => {
        try {
          const reservationData = { date, time };
          const response = await createReservation(reservationData);
          const responseData = response.data;

          switch (responseData.status) {
            case 'success':
              setReservations((prev) => {
                const updated = { ...prev };
                if (!updated[date]) updated[date] = {};
                if (!updated[date][time]) updated[date][time] = [];
                updated[date][time].push(userName);
                return updated;
              });

              updateCredits(-1);

              setUserBookings((prev) => ({
                ...prev,
                [date]: time,
              }));

              setAlertState({
                visible: true,
                title: t('reservationScreen.success'),
                message: t('reservationScreen.reservationSuccessMessage'),
                type: 'success',
                confirmAction: null,
              });
              break;

            case 'already_booked':
              setAlertState({
                visible: true,
                title: t('reservationScreen.alreadyBooked'),
                message: t('reservationScreen.alreadyBookedMessage', { date, time }),
                type: 'info',
                confirmAction: null,
              });
              break;

            case 'fully_booked':
              setAlertState({
                visible: true,
                title: t('reservationScreen.fullyBooked'),
                message: t('reservationScreen.fullyBookedMessage', { date, time }),
                type: 'alert',
                confirmAction: null,
              });

            case 'error':
            default:
              setAlertState({
                visible: true,
                title: t('reservationScreen.reservationFailed'),
                message: t('reservationScreen.errorMakingReservation'),
                type: 'error',
                confirmAction: null,
              });
              break;
          }
        } catch (error) {
          setAlertState({
            visible: true,
            title: t('reservationScreen.reservationFailed'),
            message: t('reservationScreen.errorMakingReservation'),
            type: 'error',
            confirmAction: null,
          });
          console.error('Error creating reservation:', error);
        }
      },
    });
  };

  const handleConfirm = () => {
    if (alertState.confirmAction) {
      alertState.confirmAction();
    }
    setAlertState({ ...alertState, visible: false, confirmAction: null });
  };

  const cancelBooking = () => {
    const { date, time } = user?.booking || {};
    if (date && time) {
      setReservations((prev) => {
        const updated = { ...prev };
        if (updated[date] && updated[date][time]) {
          updated[date][time] = updated[date][time].filter(
            (name) => name !== user?.username
          );
          if (updated[date][time].length === 0) {
            delete updated[date][time];
          }
          if (Object.keys(updated[date]).length === 0) {
            delete updated[date];
          }
        }
        return updated;
      });
      updateCredits(1); // Assuming cancellation refunds a credit
      setUserBookings((prev) => {
        const updated = { ...prev };
        delete updated[date];
        return updated;
      });
      setAlertState({
        visible: true,
        title: t('reservationScreen.bookingCanceled'),
        message: t('reservationScreen.bookingCanceledMessage'),
        type: 'success',
        confirmAction: null,
      });
    }
  };

  const showReservationDetails = (slot, date) => {
    setSelectedSlot({ ...slot, date });
    setModalVisible(true);
  };

  const renderTimeSlotsForDate = (date) => {
    const slots = generateTimeSlots(date, businessHours, reservations, slotDuration, maxUsersPerSlot);

    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    const reservationsForDate = reservations[date] || {};

    return (
      <View key={date} style={styles.dateSection} onLayout={handleDateLayout(date)}>
        <View style={styles.dateColumn}>
          <Text style={styles.dayOfMonth}>{day}</Text>
          <Text style={styles.dayOfWeek}>{dayOfWeek}</Text>
        </View>
        <View style={styles.slotsColumn}>
          {slots.length === 0 ? (
            <Text style={styles.noSlotsText}>
              {t('reservationScreen.noAvailableSlots')}
            </Text>) : (
            slots.map((slot, index) => (
              <TimeSlot
                key={slot.time}
                index={index}
                slot={slot}
                theme={theme}
                scrollY={scrollY}
                handleReservation={(time) => handleReservation(time, date)}
                showReservationDetails={() => showReservationDetails(slot, date)}
                maxUsersPerSlot={3}
              />
            ))
          )}
        </View>
      </View>
    );
  };

  const loadNextDate = () => {
    const lastDisplayedDate = displayedDates[displayedDates.length - 1];
    const nextDate = moment(lastDisplayedDate).add(1, 'day');
    const nextDateString = nextDate.format('YYYY-MM-DD');

    if (nextDate.isBefore(maxDate)) {
      setDisplayedDates((prev) => [...prev, nextDateString]);
    }
  };

  const renderCustomHeader = () => {
    const currentMoment = moment(currentMonth, 'YYYY-MM');
    const minMoment = moment(minDate, 'YYYY-MM-DD').startOf('month');
    const maxMoment = moment(maxDate, 'YYYY-MM-DD').endOf('month');

    const canGoBack = currentMoment.isAfter(minMoment, 'month');
    const canGoForward = currentMoment.isBefore(maxMoment, 'month');

    const changeMonth = (direction) => {
      const newMonth =
        direction === 'next'
          ? currentMoment.clone().add(1, 'month')
          : currentMoment.clone().subtract(1, 'month');

      if (newMonth.isBetween(minMoment, maxMoment, 'month', '[]')) {
        setCurrentMonth(newMonth.format('YYYY-MM'));
      }
    };

    return (
      <CalendarHeader
        currentMonth={currentMoment.format('MMMM YYYY')}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onChangeMonth={changeMonth}
      />
    );
  };

  return (
    <>
      <AppBar />
      <View style={styles.container}>
        <View style={styles.calendarContainer}>
        {calendarLoading || configLoading ? (
            <ActivityIndicator size="large" color="#4682B4" style={styles.spinner} />
          ) : (
            <Calendar
              current={currentMonth}
              minDate={minDate}
              maxDate={maxDate}
              onDayPress={handleDateSelect}
              markedDates={{
                ...markedDates,
                ...(selectedDate && {
                  [selectedDate]: { selected: true, selectedColor: '#4682B4' },
                }),
              }}
              hideArrows={true}
              hideExtraDays={true}
              disableMonthChange={true}
              renderHeader={renderCustomHeader}
              theme={{
                arrowColor: '#4682B4',
                arrowStyle: {
                  padding: 5,
                },
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#4682B4',
                selectedDayBackgroundColor: '#4682B4',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#4682B4',
                dayTextColor: '#2f4f4f',
                textDisabledColor: '#d9e1e8',
                dotColor: '#4682B4',
                selectedDotColor: '#ffffff',
                monthTextColor: '#4682B4',
                indicatorColor: '#4682B4',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={{ width: '100%' }} // Ensures the calendar takes the full width of its container
            />
          )}
        </View>

        {!selectedDate && (
          <Text style={styles.selectDateText}>
            {t('reservationScreen.pleaseSelectDate')}
          </Text>
        )}
        {selectedDate && (
          <Animated.ScrollView
            style={styles.timeSlotsContainer}
            ref={scrollViewRef}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            onMomentumScrollEnd={({ nativeEvent }) => {
              if (
                nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height >=
                nativeEvent.contentSize.height - 20
              ) {
                loadNextDate();
              }

              const scrollPosition = nativeEvent.contentOffset.y;
              let closestDate = null;
              let closestDistance = Infinity;

              for (const date in dateLayouts) {
                const distance = Math.abs(dateLayouts[date].y - scrollPosition);
                if (distance < closestDistance) {
                  closestDistance = distance;
                  closestDate = date;
                }
              }

              if (closestDate && closestDate !== selectedDate) {
                setSelectedDate(closestDate);
              }
            }}
          >
            {displayedDates.map((date, index) => (
              <React.Fragment key={date}>
                {renderTimeSlotsForDate(date)}
                {index < displayedDates.length - 1 && (
                  <View style={styles.dateSeparator} />
                )}
              </React.Fragment>
            ))}
          </Animated.ScrollView>
        )}

        {/* Reservation Details Modal */}
        <ReservationModal
          visible={modalVisible}
          slot={selectedSlot}
          onClose={() => setModalVisible(false)}
        />

        {/* Current Booking Modal */}
        <BookingModal
          visible={bookingModalVisible}
          booking={user?.booking}
          onCancel={cancelBooking}
          onClose={() => setBookingModalVisible(false)}
        />

        {/* Custom Alert */}
        <CustomAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          onConfirm={handleConfirm}
          onCancel={() => setAlertState({ ...alertState, visible: false })}
          type={alertState.type}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  calendarContainer: {
    height: 350, // Fixed height to keep space consistent
    width: '100%', // Ensure the calendar takes the full width of the container
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // White background for the calendar
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  spinner: {
    height: 350, // Ensure spinner takes the same height as the calendar container
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectDateText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#4682B4',
  },
  timeSlotsContainer: {
    flex: 1, // Takes up the remaining space below the calendar
    marginTop: 20,
    paddingHorizontal: 15,
  },
  dateSection: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  dateColumn: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dayOfMonth: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
  },
  dayOfWeek: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  slotsColumn: {
    flex: 1,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  dateSeparator: {
    height: 1,
    backgroundColor: '#CED4DA',
    marginVertical: 15,
    width: '100%',
  },
});

export default CustomReservationCalendar;
