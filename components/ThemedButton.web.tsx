import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import * as React from 'react';

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'outlined' | 'small';
};

export function ThemedButton({
  title,
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const { containerStyle, textStyle } = getStylesByType(type, backgroundColor);


  return (
    <TouchableOpacity style={[containerStyle, style]} {...rest}>
      <Text style={[textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

function getStylesByType(
  type: 'default' | 'outlined' | 'small',
  backgroundColor: string,
): { containerStyle: ViewStyle; textStyle: TextStyle } {
  switch (type) {
    case 'outlined':
      return {
        containerStyle: {
          padding: 16,
          borderRadius: 16,
          backgroundColor: 'transparent',
          borderColor: '090809',
          borderStyle: 'solid',
          borderWidth: 1,
        },
        textStyle: {
          color: '#090809',
          fontFamily: 'Montserrat',
          fontSize: 16,
          textAlign: 'center'
        },
      };
    case 'small':
      return {
        containerStyle: {
          backgroundColor,
          paddingHorizontal: 16,
          borderRadius: 16,
          height: 28,
          padding: 6
        },
        textStyle: {
          color: '#F8FFE5',
          fontFamily: 'Montserrat',
          fontSize: 14,
        },
      };
    case 'default':
    default:
      return {
        containerStyle: {
          padding: 16,
          borderRadius: 16,
          backgroundColor: '#090809',
        },
        textStyle: {
          color: '#F8FFE5',
          fontFamily: 'Montserrat',
          fontSize: 14,
          textAlign: 'center'
        },
      };
  }
}
