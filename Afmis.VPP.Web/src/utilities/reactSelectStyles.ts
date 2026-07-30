/**
 * React Select Theme-Aware Styles Utility
 * 
 * This utility provides theme-aware styles for React Select components.
 * It integrates with the application's CSS variable-based theming system
 * to ensure select inputs display correctly in both light and dark modes.
 */

import { StylesConfig, GroupBase } from 'react-select';

/**
 * Get theme-aware styles for React Select components
 * 
 * @param isDarkMode - Whether the application is in dark mode
 * @returns React Select styles configuration object
 */
export const getReactSelectStyles = <Option, IsMulti extends boolean = false>(
  isDarkMode: boolean
): StylesConfig<Option, IsMulti, GroupBase<Option>> => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: isDarkMode 
      ? 'var(--vz-react-select-bg)' 
      : 'var(--vz-input-bg)',
    borderColor: state.isFocused 
      ? 'var(--vz-primary)' 
      : 'var(--vz-input-border)',
    boxShadow: 'none',
    minHeight: '38px',
    '&:hover': {
      borderColor: 'var(--vz-primary)',
    },
  }),
  
  menu: (provided) => ({
    ...provided,
    backgroundColor: isDarkMode 
      ? 'var(--vz-react-select-menu-bg)' 
      : 'white',
    border: `1px solid var(--vz-border-color)`,
    boxShadow: 'var(--vz-box-shadow)',
    zIndex: 9999,
  }),
  
  menuList: (provided) => ({
    ...provided,
    backgroundColor: isDarkMode 
      ? 'var(--vz-react-select-menu-bg)' 
      : 'white',
  }),
  
  option: (provided, state) => {
    let backgroundColor = isDarkMode 
      ? 'var(--vz-react-select-menu-bg)' 
      : 'white';
    
    if (state.isSelected) {
      backgroundColor = 'var(--vz-primary)';
    } else if (state.isFocused) {
      backgroundColor = isDarkMode 
        ? 'var(--vz-react-select-option-hover)' 
        : 'var(--vz-gray-100)';
    }
    
    return {
      ...provided,
      backgroundColor,
      color: state.isSelected 
        ? 'white' 
        : 'var(--vz-body-color)',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: state.isSelected 
          ? 'var(--vz-primary)' 
          : isDarkMode 
            ? 'var(--vz-gray-300)' 
            : 'var(--vz-gray-200)',
      },
    };
  },
  
  singleValue: (provided) => ({
    ...provided,
    color: isDarkMode 
      ? 'var(--vz-react-select-text)' 
      : 'var(--vz-body-color)',
  }),
  
  placeholder: (provided) => ({
    ...provided,
    color: isDarkMode 
      ? 'var(--vz-react-select-placeholder)' 
      : 'var(--vz-gray-600)',
  }),
  
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: isDarkMode 
      ? 'var(--vz-react-select-multi-value-bg)' 
      : 'var(--vz-gray-100)',
    borderRadius: '4px',
  }),
  
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'var(--vz-body-color)',
    fontSize: '85%',
  }),
  
  multiValueRemove: (provided) => ({
    ...provided,
    color: isDarkMode 
      ? 'var(--vz-gray-500)' 
      : 'var(--vz-gray-600)',
    '&:hover': {
      backgroundColor: isDarkMode 
        ? 'var(--vz-gray-400)' 
        : 'var(--vz-gray-300)',
      color: isDarkMode ? 'white' : 'var(--vz-gray-800)',
    },
  }),
  
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: 'var(--vz-border-color)',
  }),
  
  dropdownIndicator: (provided) => ({
    ...provided,
    color: isDarkMode 
      ? 'var(--vz-gray-500)' 
      : 'var(--vz-gray-600)',
    '&:hover': {
      color: isDarkMode 
        ? 'var(--vz-gray-400)' 
        : 'var(--vz-gray-500)',
    },
  }),
  
  clearIndicator: (provided) => ({
    ...provided,
    color: isDarkMode 
      ? 'var(--vz-gray-500)' 
      : 'var(--vz-gray-600)',
    '&:hover': {
      color: isDarkMode 
        ? 'var(--vz-gray-400)' 
        : 'var(--vz-gray-500)',
    },
  }),
  
  loadingIndicator: (provided) => ({
    ...provided,
    color: isDarkMode 
      ? 'var(--vz-gray-500)' 
      : 'var(--vz-gray-600)',
  }),
  
  input: (provided) => ({
    ...provided,
    color: isDarkMode 
      ? 'var(--vz-react-select-text)' 
      : 'var(--vz-body-color)',
  }),
  
  noOptionsMessage: (provided) => ({
    ...provided,
    color: 'var(--vz-gray-500)',
  }),
  
  loadingMessage: (provided) => ({
    ...provided,
    color: 'var(--vz-gray-500)',
  }),
  
  group: (provided) => ({
    ...provided,
    backgroundColor: isDarkMode 
      ? 'var(--vz-react-select-menu-bg)' 
      : 'white',
  }),
  
  groupHeading: (provided) => ({
    ...provided,
    color: 'var(--vz-gray-600)',
    backgroundColor: isDarkMode 
      ? 'var(--vz-gray-300)' 
      : 'var(--vz-gray-100)',
  }),
});

/**
 * Get the React Select theme configuration
 * 
 * @param isDarkMode - Whether the application is in dark mode
 * @returns React Select theme object
 */
export const getReactSelectTheme = (isDarkMode: boolean) => ({
  borderRadius: 4,
  colors: {
    primary: 'var(--vz-primary)',
    primary75: 'var(--vz-primary)',
    primary50: 'var(--vz-primary)',
    primary25: isDarkMode 
      ? 'var(--vz-gray-300)' 
      : 'var(--vz-gray-100)',
    danger: 'var(--vz-danger)',
    dangerLight: isDarkMode 
      ? 'var(--vz-gray-300)' 
      : 'var(--vz-gray-100)',
    neutral0: isDarkMode 
      ? 'var(--vz-gray-200)' 
      : 'white',
    neutral5: isDarkMode 
      ? 'var(--vz-gray-300)' 
      : 'var(--vz-gray-100)',
    neutral10: isDarkMode 
      ? 'var(--vz-gray-300)' 
      : 'var(--vz-gray-100)',
    neutral20: 'var(--vz-border-color)',
    neutral30: 'var(--vz-border-color)',
    neutral40: 'var(--vz-gray-500)',
    neutral50: 'var(--vz-gray-500)',
    neutral60: 'var(--vz-gray-600)',
    neutral70: 'var(--vz-gray-700)',
    neutral80: isDarkMode 
      ? 'var(--vz-gray-800)' 
      : 'var(--vz-gray-900)',
    neutral90: 'var(--vz-gray-900)',
  },
  spacing: {
    baseUnit: 4,
    controlHeight: 38,
    menuGutter: 8,
  },
});

export default getReactSelectStyles;
