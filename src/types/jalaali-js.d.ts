declare module "jalaali-js" {
    export interface GregorianDate {
        gy: number;
        gm: number;
        gd: number;
    }

    export interface JalaliDate {
        jy: number;
        jm: number;
        jd: number;
    }

    export function toGregorian(jy: number, jm: number, jd: number): GregorianDate;
    export function toJalaali(gy: number, gm: number, gd: number): JalaliDate;
}
