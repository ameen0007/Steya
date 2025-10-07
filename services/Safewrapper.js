
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeWrapper = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  return (
    
      <View
        style={[
          {
            flex: 1,
            backgroundColor: '#FFFFFF', // Ensures white background under status bar
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
          style,
        ]}
      >
        {children}
      </View>
   
  );
};

export default SafeWrapper;