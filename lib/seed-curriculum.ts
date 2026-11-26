import type { CurriculumData, LearningCard, Lesson, Unit } from "./types";
import { UNIT_TALK_AND_FAMILY } from "./curriculum/part1-talk-and-family";
import { UNIT_SCHOOL_AND_BODY } from "./curriculum/part2-school-and-body";
import { UNIT_HOME_AND_ANIMALS } from "./curriculum/part3-home-and-animals";
import { UNIT_WORLD_AND_QNA } from "./curriculum/part4-world-and-qna";

export const SEED_CURRICULUM: CurriculumData = {
  version: 4,
  updatedAt: "2026-11-26T08:00:00.000Z",
  units: [
    UNIT_TALK_AND_FAMILY,
    UNIT_SCHOOL_AND_BODY,
    UNIT_HOME_AND_ANIMALS,
    UNIT_WORLD_AND_QNA,
  ],
};

export interface FlattenedCard {
  card: LearningCard;
  lesson: Lesson;
  unit: Unit;
}

export function flattenCards(curriculum: CurriculumData): FlattenedCard[] {
  const result: FlattenedCard[] = [];
  for (const unit of curriculum.units) {
    for (const lesson of unit.lessons) {
      for (const card of lesson.cards) {
        result.push({ card, lesson, unit });
      }
    }
  }
  return result;
}

export function findLessonById(
  curriculum: CurriculumData,
  lessonId: string
): { unit: Unit; lesson: Lesson } | null {
  for (const unit of curriculum.units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
}
