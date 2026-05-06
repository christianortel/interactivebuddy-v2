export interface LayoutSize {
  width: number;
  height: number;
}

export interface CanvasFitStyles {
  width: string;
  height: string;
  marginLeft: string;
  marginTop: string;
}

export function getCanvasFitStyles(container: LayoutSize, stage: LayoutSize): CanvasFitStyles {
  const targetRatio = stage.width / stage.height;
  const availableRatio = container.width / container.height;

  if (availableRatio > targetRatio) {
    return {
      width: `${Math.floor(container.height * targetRatio)}px`,
      height: "100%",
      marginLeft: `${Math.floor((container.width - container.height * targetRatio) / 2)}px`,
      marginTop: "0"
    };
  }

  return {
    width: "100%",
    height: `${Math.floor(container.width / targetRatio)}px`,
    marginLeft: "0",
    marginTop: `${Math.floor((container.height - container.width / targetRatio) / 2)}px`
  };
}
