import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dimensions, PanResponder, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

const style = {
  container: {
    flex: 1,
  },
};

class Swiper extends Component {
  constructor(props) {
    super(props);
    this.pan = new Animated.ValueXY();
    this.state = {
      currentPage: 0,
      animation: false,
    };
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({ // eslint-disable-line
      onStartShouldSetPanResponderCapture: () => !this.valueY,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderMove: this.handlePanResponderMove(),
      onPanResponderRelease: this.handlePanResponderEnd,
    });
  }

  componentDidMount() {
    this.pan.y.addListener(({ value }) => { this.valueY = value; });
  }

  handlePanResponderGrant = () => {
    this.pan.setValue({ x: 0, y: 0 });
  };

  handlePanResponderMove = () => Animated.event([
    null, {
      dx: this.pan.x,
      dy: this.pan.y,
      useNativeDriver: true,
    },
  ]);

  handlePanResponderEnd = (e, { dy }) => {
    if (dy < -150) {
      Animated.timing(this.pan, {
        toValue: { x: 0, y: -height },
        duration: 400,
        useNativeDriver: true,
      }).start((status) => {
        if (status.finished) {
          if (this.state.currentPage + 1 < this.props.cards.length) {
            this.setState({ currentPage: this.state.currentPage + 1 });
          }
          this.pan.setValue({ x: 0, y: 0 });
        }
      });
    } else if (dy > 150) {
      Animated.timing(this.pan, {
        toValue: { x: 0, y: height },
        duration: 400,
        useNativeDriver: true,
      }).start((status) => {
        if (status.finished) {
          if (this.state.currentPage - 1 >= 0) {
            this.setState({ currentPage: this.state.currentPage - 1 });
          }
          this.pan.setValue({ x: 0, y: 0 });
        }
      });
    } else {
      Animated.timing(this.pan, {
        toValue: { x: 0, y: 0 },
        duration: 400,
        useNativeDriver: true,
      }).start((status) => {
        if (status.finished) {
          this.pan.setValue({ x: 0, y: 0 });
        }
      });
    }
  }

  renderCards = (currentTranslateY, prevTranslateY, nextTranslateY, lastTranslateY) => {
    const { cards } = this.props;

    return cards.map((card, index) => (
      <Animated.View
        key={index} //eslint-disable-line
        style={{
          zIndex: index === this.state.currentPage
            ? 1 : (index === this.state.currentPage - 1)
              ? 2 : (index === this.state.currentPage + 1)
                ? 0 : -1,
          transform: [index + 1 === cards.length
            ? { translateY: lastTranslateY } : { translateY: index === this.state.currentPage
              ? currentTranslateY : (index === this.state.currentPage - 1)
                ? prevTranslateY : (index === this.state.currentPage + 1)
                  ? nextTranslateY : -height }],
          width,
          height,
          position: 'absolute',
        }}
      >
        {card}
      </Animated.View>
    ));
  }

  render() {
    const currentTranslateY = this.pan.y.interpolate({
      inputRange: [-height, 0, height],
      outputRange: [-height, 0, 0],
    });

    const prevTranslateY = this.pan.y.interpolate({
      inputRange: [-height, 0, height],
      outputRange: [-height, -height, 0],
    });

    const nextTranslateY = this.pan.y.interpolate({
      inputRange: [-height, 0, height],
      outputRange: [0, 0, 0],
    });

    const lastTranslateY = this.pan.y.interpolate({
      inputRange: [-height, 0, height],
      outputRange: [0, 0, 0],
    });

    return (
      <Animated.View style={style.container} {...this._panResponder.panHandlers}>
        {this.renderCards(currentTranslateY, prevTranslateY, nextTranslateY, lastTranslateY)}
      </Animated.View>
    );
  }
}

Swiper.propTypes = {
  cards: PropTypes.array.isRequired,
};

export default Swiper;
