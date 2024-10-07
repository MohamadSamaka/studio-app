// components/AvatarStack.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';

const AvatarStack = React.memo(({ participants, maxAvatars = 3, size = 32, onPress }) => {
  const displayParticipants = participants.slice(0, maxAvatars);
  const extraCount = participants.length - maxAvatars;

  return (
    <View style={styles.stackContainer}>
      {displayParticipants.map((participant, index) => (
        <TouchableOpacity key={index} onPress={onPress}>
          {participant.avatarUrl ? (
            <Avatar.Image
              size={size}
              source={{ uri: participant.avatarUrl }}
              style={[
                styles.avatar,
                {
                  marginLeft: index === 0 ? 0 : -size / 3,
                  zIndex: participants.length - index,
                },
              ]}
            />
          ) : (
            <Avatar.Text
              size={size}
              label={participant.name[0]}
              style={[
                styles.avatar,
                {
                  marginLeft: index === 0 ? 0 : -size / 3,
                  zIndex: participants.length - index,
                },
              ]}
            />
          )}
        </TouchableOpacity>
      ))}
      {extraCount > 0 && (
        <TouchableOpacity onPress={onPress}>
          <Avatar.Text
            size={size}
            label={`+${extraCount}`}
            style={[
              styles.extraAvatar,
              {
                marginLeft: -size / 3,
                zIndex: 0,
              },
            ]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  stackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  extraAvatar: {
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#6c757d',
  },
});

export default AvatarStack;
