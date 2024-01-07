export type Board = ("" | number)[];
export type DifficultyLevel = "easy" | "medium" | "hard";

export class GameStepRecordBean {
    coordX: number;
    coordY: number;
    valuePre: number;
    valueNow: number;

    constructor(coordX: number, coordY: number, valuePre: number, valueNow: number) {
        this.coordX = coordX;
        this.coordY = coordY;
        this.valuePre = valuePre;
        this.valueNow = valueNow;
    }
}
