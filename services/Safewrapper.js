import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeWrapper = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Android Status Bar (requires explicit background) */}
      {Platform.OS === 'android' && (
        <StatusBar 
          backgroundColor="white" 
         style="dark"
          translucent={false}
        />
      )}

      {/* iOS Status Bar (controlled by SafeAreaView) */}
      <View
        style={[
          {
            flex: 1,
            backgroundColor: 'white', // Ensures white background under status bar
            paddingTop: insets.top,
            // paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
          style,
        ]}
      >
        {children}
      </View>
    </>
  );
};

export default SafeWrapper;