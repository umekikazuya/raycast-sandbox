// Hello worldを出力する
import { Detail } from "@raycast/api";

export default function Command() {
  return (
    <Detail
      markdown={`# Hello World`}
    />
  );
}
