import React from 'react';
import Icon from 'react-native-ico-material-design';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

var iconHeight = 26;
var iconWidth = 26;

export default class Task extends React.Component {
  render() {
    const { isModalVisible, children, setModalVisible } = this.props;
    return (
      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.container,
            {
              ...Platform.select({
                android: {
                }
              })
            }
          ]}
        >
          <View style={styles.cardMain}>
            <View style={styles.card}>{children}</View>
            <Pressable
              style={styles.btnContainer}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close-button" height={iconHeight} width={iconWidth} color='#404040' />
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  cardMain: {
    position: 'absolute',
    top: 100,
    width: '11%',
    alignSelf: 'center',
    zIndex: 1000,
    elevation: 1000,
    paddingBottom: 54
  },
  card: {
    width: '11%',
    borderRadius: 100,
    backgroundColor: '#ffffff',
    alignSelf: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  btnContainer: ({ pressed }) => ({
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
    height: 44,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: pressed ? 0.5 : 1
  }),
  textContainer: { textAlign: 'center', fontSize: 17, fontWeight: '500' }
});
