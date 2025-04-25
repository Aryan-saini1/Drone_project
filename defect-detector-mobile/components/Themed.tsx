import { Text as DefaultText, View as DefaultView, useColorScheme } from 'react-native';

export type TextProps = DefaultText['props'];
export type ViewProps = DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
) {
  const theme = useColorScheme() ?? 'dark';
  const colorFromProps = props[theme];

  return colorFromProps;
}

export function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  const color = useThemeColor({ light: '#000', dark: '#fff' }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1e293b' }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
} 