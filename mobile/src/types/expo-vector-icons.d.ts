declare module '@expo/vector-icons/Ionicons' {
  import * as React from 'react';
  import { TextProps } from 'react-native';

  export interface IoniconsProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Ionicons extends React.Component<IoniconsProps> {}
}
