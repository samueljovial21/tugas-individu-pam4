import React, { useEffect, useRef } from 'react';

export default function useComponent(Component, props) {
  const propsRef = useRef(props);
  propsRef.current = props;
  useEffect(() => {
    propsRef.current = null;
  }, []);
  return useRef(() => {
    const props = propsRef.current;
    if (props === null) {
      throw new Error(
      );
    }
    return <Component {...props} />;
  }).current;
}
