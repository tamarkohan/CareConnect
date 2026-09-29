declare module '*.svg' {
    import React from 'react';
    import { SvgProps } from 'react-native-svg';
    const content: React.FC<SvgProps>;
    export default content;
}
declare module '*.png' {
    const value: any;
    export default value;
}

// Packages that ship JS-only bundles in this project setup
declare module '@react-navigation/native';
declare module '@react-navigation/native-stack';
declare module 'react-native-safe-area-context';
declare module 'expo-blur';