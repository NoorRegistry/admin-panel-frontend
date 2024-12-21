import { TableProps } from "antd";
import { TableRef } from "antd/es/table";
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type UseTableScroll = {
  tableRef: RefObject<TableRef>;
  scroll: TableProps["scroll"];
};

type ScrollX = string | number | true | undefined;

const getPaginationHeight = (tableWrapper: HTMLDivElement) => {
  let calculatedHeight = 0;

  const paginationElement = tableWrapper.getElementsByClassName(
    "ant-table-pagination",
  )[0];
  if (!paginationElement) return calculatedHeight;

  const { height } = paginationElement.getBoundingClientRect();
  const styles = window.getComputedStyle(paginationElement);
  const marginTop = parseFloat(styles.marginTop) || 0;
  const marginBottom = parseFloat(styles.marginBottom) || 0;

  calculatedHeight += height + marginTop + marginBottom;

  return calculatedHeight;
};

export const useTableScroll = (
  scrollX: ScrollX = "max-content",
  stretchByPage: boolean = true,
  delay: number = 50,
): UseTableScroll => {
  const [scrollY, setScrollY] = useState<number | undefined>();
  const tableRef = useRef<TableRef>(null);

  const calcScrollY = () => {
    requestAnimationFrame(() => {
      const tableWrapper = tableRef.current?.nativeElement;
      if (!tableWrapper) return;

      const tBody = tableWrapper.getElementsByTagName("tbody")[0];
      if (!tBody) return;

      const empty = tableWrapper.getElementsByClassName("ant-empty")[0];
      if (empty) return setScrollY(undefined);

      const { y: tBodyY } = tBody.getBoundingClientRect();
      const totalHeight =
        window.innerHeight - tBodyY - getPaginationHeight(tableWrapper);

      setScrollY(totalHeight);
    });
  };

  const debounce = useDebouncedCallback(calcScrollY, delay);

  useEffect(() => {
    debounce();
    window.addEventListener("resize", debounce);

    return () => {
      window.removeEventListener("resize", debounce);
    };
  }, [debounce]);

  useLayoutEffect(() => {
    const tableWrapper = tableRef.current?.nativeElement;
    if (!tableWrapper) return;

    const observer = new MutationObserver(debounce);
    observer.observe(tableWrapper, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [debounce]);

  useLayoutEffect(() => {
    if (!stretchByPage) return;

    const tableWrapper = tableRef.current?.nativeElement;
    if (!tableWrapper) return;

    const tableBody = tableWrapper.getElementsByClassName(
      "ant-table-body",
    )[0] as HTMLDivElement;
    if (!tableBody) return;

    tableBody.style.height = `${scrollY}px`;
  }, [scrollY]);

  return { tableRef, scroll: { x: scrollX, y: scrollY } };
};
