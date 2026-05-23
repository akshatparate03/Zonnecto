// app/index.js — Entry redirect
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
