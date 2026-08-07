import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ClipboardList,
  Compass,
  Eye,
  GraduationCap,
  History,
  LineChart,
  ListChecks,
  MessageCircleQuestion,
  Moon,
  网 as _unused,
} from "lucide-react";
import { Reveal } from "@/components/landing/Reveal";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return <div />;
}
