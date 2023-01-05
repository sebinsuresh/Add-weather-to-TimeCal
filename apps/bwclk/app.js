{ // must be inside our own scope here so that when we are unloaded everything disappears

/************************************************
 * Includes
 */
const locale = require('locale');
const storage = require('Storage');
const clock_info = require("clock_info");


/************************************************
 * Globals
 */
const SETTINGS_FILE = "bwclk.setting.json";
const W = g.getWidth();
const H = g.getHeight();

/************************************************
 * Settings
 */
let settings = {
  screen: "Normal",
  showLock: true,
  hideColon: false,
  menuPosX: 0,
  menuPosY: 0,
};

let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
for (const key in saved_settings) {
  settings[key] = saved_settings[key];
}

let isFullscreen = function() {
  var s = settings.screen.toLowerCase();
  if(s == "dynamic"){
    return Bangle.isLocked();
  } else {
    return s == "full";
  }
};

let getLineY = function(){
  return H/5*2 + (isFullscreen() ? 0 : 8);
}

/************************************************
 * Assets
 */
// Manrope font
Graphics.prototype.setLargeFont = function(scale) {
  // Actual height 47 (48 - 2)
  this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAD/AAAAAAAAA/wAAAAAAAAP8AAAAAAAAD/AAAAAAAAA/wAAAAAAAAP8AAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAD/AAAAAAAAP/wAAAAAAAf/8AAAAAAB///AAAAAAH///wAAAAAf///8AAAAB/////AAAAH////8AAAAP////wAAAA/////AAAAB////+AAAAA////4AAAAAP///gAAAAAD//+AAAAAAA//4AAAAAAAP/gAAAAAAAD/AAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///+AAAAAB////8AAAAB/////wAAAA/////+AAAA//////wAAAf/////+AAAH//////wAAD//////+AAB/+AAAf/gAAf+AAAA/8AAH/AAAAH/AAD/gAAAA/4AA/wAAAAH+AAP8AAAAB/gAD+AAAAAf4AA/gAAAAH+AAP4AAAAA/gAD+AAAAAf4AA/wAAAAH+AAP8AAAAB/gAD/AAAAA/4AA/4AAAAP+AAH/AAAAH/AAB/4AAAH/wAAP/wAAP/4AAD//////+AAAf//////AAAD//////gAAAf/////wAAAD/////4AAAAf////4AAAAB////4AAAAAB///gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAH/AAAAAAAAD/gAAAAAAAA/4AAAAAAAAf8AAAAAAAAH+AAAAAAAAD/gAAAAAAAB/wAAAAAAAAf8AAAAAAAAP///////AAD///////wAA///////8AAP///////AAD///////wAA///////8AAP///////AAD///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAB/AAAA/gAAA/wAAA/4AAAf8AAAf+AAAP/AAAP/gAAH/wAAH/4AAD/8AAD/+AAB//AAA//gAA//wAAf/AAAP/8AAH/AAAH//AAD/gAAD//wAA/wAAB//8AAP8AAA///AAD/AAAf+fwAA/gAAP/n8AAP4AAH/x/AAD+AAD/4fwAA/gAB/8H8AAP8AAf+B/AAD/AAP/AfwAA/4AH/gH8AAH/AH/wB/AAB/8H/4AfwAAP///8AH8AAD////AB/AAAf///gAfwAAD///wAH8AAAf//4AB/AAAD//4AAfwAAAP/8AAH8AAAAf4AAB/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAADgAAAfwAAAB+AAAH8AAAAfwAAB/AAAAH+AAAfwAAAB/wAAH8AAAA/+AAB/AAAAP/gAAfwA4AA/8AAH8AfgAH/AAB/AP8AA/4AAfwD/gAH+AAH8B/4AB/gAB/A/8AAf4AAfwf/AAD+AAH8P/wAA/gAB/H/8AAf4AAfz//gAH+AAH8//4AB/gAB/f//AA/4AAf/+/4Af8AAH//P/AP/AAB//j////gAAf/wf///4AAH/4H///8AAB/8A///+AAAf+AH///AAAH/AA///gAAB/gAD//wAAAfwAAP/wAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAAH/wAAAAAAAH/8AAAAAAAH//AAAAAAAH//wAAAAAAH//8AAAAAAH///AAAAAAH///wAAAAAH///8AAAAAP//9/AAAAAP//8fwAAAAP//4H8AAAAP//4B/AAAAP//4AfwAAAP//4AH8AAAD//4AB/AAAA//4AAfwAAAP/4AAH8AAAD/wAAB/AAAA/wAAAfwAAAPwAH////AADwAB////wAAwAAf///8AAAAAH////AAAAAB////wAAAAAf///8AAAAAH////AAAAAA////wAAAAAAAfwAAAAAAAAH8AAAAAAAAB/AAAAAAAAAfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAGAHwAAAB///gB+AAAH///8AfwAAB////AP+AAAf///wD/wAAH///+A/+AAB////gP/gAAf///4A/8AAH/8P8AH/AAB/AD+AA/4AAfwA/gAH+AAH8AfwAB/gAB/AH8AAf4AAfwB/AAH+AAH8AfwAB/gAB/AH8AAf4AAfwB/gAH+AAH8Af4AB/gAB/AH/AA/wAAfwB/4Af8AAH8AP/AP/AAB/AD////gAAfwAf///wAAH8AD///8AAB/AA///+AAAfwAH///AAAAAAA///gAAAAAAD//gAAAAAAAP/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB///4AAAAAH////wAAAAH/////AAAAD/////4AAAB//////AAAA//////4AAAf//////AAAP//////4AAD/8D/w/+AAB/4B/wD/wAAf8A/wAf8AAP+AP4AD/gAD/AD+AAf4AA/wB/AAH+AAP4AfwAB/gAD+AH8AAf4AA/gB/AAH+AAP4AfwAB/gAD+AH+AAf4AA/wB/gAH+AAP8Af8AD/gAD/gH/gB/wAAf8A/8A/8AAH/AP///+AAB/gB////gAAPwAP///wAAB4AD///4AAAMAAf//8AAAAAAD//+AAAAAAAP/+AAAAAAAA/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfwAAAAAAAAH8AAAAAAAAB/AAAAAAAAAfwAAAAAAAAH8AAAAAAAAB/AAAAABwAAfwAAAAB8AAH8AAAAD/AAB/AAAAD/wAAfwAAAH/8AAH8AAAH//AAB/AAAP//wAAfwAAP//8AAH8AAf//+AAB/AAf//8AAAfwA///8AAAH8A///4AAAB/A///4AAAAfx///wAAAAH9///wAAAAB////gAAAAAf///gAAAAAH///AAAAAAB///AAAAAAAf/+AAAAAAAH/+AAAAAAAB/8AAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAf/AAAAAP+Af/8AAAAP/4P//wAAAP//P//+AAAH//////wAAB//////8AAA///////gAAf//////8AAH////gP/AAD/wf/wA/wAA/4D/4AP+AAP8Af8AB/gAD/AH/AAf4AA/gA/wAH+AAP4AP4AA/gAD+AD/AAP4AA/gA/wAH+AAP8Af8AB/gAD/AH/AAf4AA/4D/4AP+AAP/B//AH/AAB////4D/wAAf//////8AAD//////+AAAf//////AAAH//////wAAA//8///4AAAD/+D//8AAAAP+Af/8AAAAAAAB/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAB//AAAAAAAB//8AAAAAAB///gAAgAAA///8AAcAAAf///gAPAAAH///8AH4AAD////AD/AAB/+H/4B/wAAf+Af+Af8AAP+AB/wD/gAD/gAf8Af4AA/wAD/AH+AAP8AA/wB/gAD+AAH8AP4AA/gAB/AD+AAP4AAfwB/gAD+AAH8Af4AA/wAD/AH+AAP8AA/gD/gAD/gAf4A/wAAf8AP8A/8AAH/gH/Af/AAA///////gAAP//////wAAB//////8AAAP/////+AAAB//////AAAAP/////AAAAA/////gAAAAD////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wA/wAAAAAP8AP8AAAAAD/AD/AAAAAA/wA/wAAAAAP8AP8AAAAAD/AD/AAAAAA/wA/wAAAAAP8AP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='),
    46,
    atob("ExspGyUkJiQnISYnFQ=="),
    62+(scale<<8)+(1<<16)
  );
  return this;
};

Graphics.prototype.setMediumFont = function(scale) {
  // Actual height 41 (42 - 2)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAB/AAAAAAAP/AAAAAAD//AAAAAA///AAAAAP///AAAAB///8AAAAf///AAAAH///wAAAB///+AAAAH///gAAAAH//4AAAAAH/+AAAAAAH/wAAAAAAH8AAAAAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///8AAAAH////AAAAP////wAAAf////4AAA/////8AAB/////+AAD/gAAH+AAD+AAAD/AAH8AAAB/AAH4AAAA/gAH4AAAAfgAH4AAAAfgAPwAAAAfgAPwAAAAfgAPwAAAAfgAHwAAAAfgAH4AAAAfgAH4AAAA/gAH8AAAA/AAD+AAAD/AAD/gAAH/AAB/////+AAB/////8AAA/////4AAAf////wAAAH////gAAAB///+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAAAAAAAfwAAAAAAA/gAAAAAAA/AAAAAAAB/AAAAAAAD+AAAAAAAD8AAAAAAAH8AAAAAAAH//////AAH//////AAH//////AAH//////AAH//////AAH//////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAA/AAAP4AAB/AAAf4AAD/AAA/4AAD/AAB/4AAH/AAD/4AAP/AAH/AAAf/AAH8AAA//AAH4AAB//AAP4AAD//AAPwAAH+/AAPwAAP8/AAPwAAf4/AAPwAA/4/AAPwAA/w/AAPwAB/g/AAPwAD/A/AAP4AH+A/AAH8AP8A/AAH/A/4A/AAD///wA/AAD///gA/AAB///AA/AAA//+AA/AAAP/8AA/AAAD/wAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAH4AAAHwAAH4AAAH4AAH4AAAH8AAH4AAAP+AAH4AAAH+AAH4A4AB/AAH4A+AA/AAH4B/AA/gAH4D/AAfgAH4H+AAfgAH4P+AAfgAH4f+AAfgAH4/+AAfgAH5/+AAfgAH5//AAfgAH7+/AA/gAH/8/gB/AAH/4f4H/AAH/wf//+AAH/gP//8AAH/AH//8AAH+AD//wAAH8AB//gAAD4AAf+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAAAAAD/AAAAAAAP/AAAAAAB//AAAAAAH//AAAAAAf//AAAAAB///AAAAAH///AAAAAf/8/AAAAB//w/AAAAH/+A/AAAA//4A/AAAD//gA/AAAH/+AA/AAAH/4AA/AAAH/gAA/AAAH+AAA/AAAHwAAA/AAAHAAf///AAEAAf///AAAAAf///AAAAAf///AAAAAf///AAAAAf///AAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAP/AHgAAH///AP4AAH///gP8AAH///gP8AAH///gP+AAH///gD/AAH/A/AB/AAH4A/AA/gAH4A+AAfgAH4B+AAfgAH4B+AAfgAH4B8AAfgAH4B8AAfgAH4B+AAfgAH4B+AAfgAH4B+AA/gAH4B/AA/AAH4A/gD/AAH4A/4H+AAH4Af//+AAH4AP//8AAH4AP//4AAHwAD//wAAAAAB//AAAAAAAf8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///8AAAAD////AAAAP////wAAAf////4AAA/////8AAB/////+AAD/gP4H+AAD/AfgD/AAH8A/AB/AAH8A/AA/gAH4B+AAfgAH4B+AAfgAPwB8AAfgAPwB8AAfgAPwB+AAfgAPwB+AAfgAH4B+AAfgAH4B/AA/gAH8B/AB/AAH+A/wD/AAD+A/8P+AAB8Af//+AAB4AP//8AAAwAH//4AAAAAD//gAAAAAA//AAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAPwAAAAAAAPwAAAAAAAPwAAAAAAAPwAAAAHAAPwAAAA/AAPwAAAD/AAPwAAAf/AAPwAAB//AAPwAAP//AAPwAA//8AAPwAH//wAAPwAf/+AAAPwB//4AAAPwP//AAAAPw//8AAAAP3//gAAAAP//+AAAAAP//wAAAAAP//AAAAAAP/4AAAAAAP/gAAAAAAP+AAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAH+A//gAAAf/h//4AAA//z//8AAB/////+AAD/////+AAD///+H/AAH+H/4B/AAH8B/wA/gAH4A/gAfgAH4A/gAfgAPwA/AAfgAPwA/AAfgAPwA/AAfgAPwA/AAfgAH4A/gAfgAH4A/gAfgAH8B/wA/gAH/H/4B/AAD///+H/AAD/////+AAB/////+AAA//z//8AAAf/h//4AAAH+A//gAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gAAAAAAD/8AAAAAAP/+AAAAAAf//AAcAAA///gA8AAB///wB+AAD/x/4B/AAD+AP4B/AAH8AH8A/gAH4AH8A/gAH4AD8AfgAP4AD8AfgAPwAB8AfgAPwAB8AfgAPwAB8AfgAPwAB8AfgAH4AD8AfgAH4AD4A/gAH8AH4B/AAD+APwD/AAD/g/wP+AAB/////+AAA/////8AAAf////4AAAP////wAAAH////AAAAA///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8APwAAAAD8APwAAAAD8APwAAAAD8APwAAAAD8APwAAAAD8APwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("DxcjFyAfISAiHCAiEg=="), 54+(scale<<8)+(1<<16));
  return this;
};

Graphics.prototype.setSmallFont = function(scale) {
  // Actual height 28 (27 - 0)
  this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/+cB//5wH//nAAAAAAAAAAAAAAAAAAAB8AAAHwAAAfAAAAAAAAAAAAAfAAAB8AAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAQcAADhwAAOHBAA4c8ADh/wAP/+AB/+AA//wAH+HAAe4cMBDh/wAOP/AA//wAP/wAH/3AAf4cABzhwAAOHAAA4cAADgAAAOAAAAAAAAAAAAAAAAAAAAwAH8HwA/4PgD/geAePA8BwcBw/BwH78DgfvwOB+HA4HAeBwcA8HDgB4f+ADg/wAGB+AAAAAAAAAAAAAAAH4AAA/wBwHngPAcOB4Bw4PAHDh4AcOPAA/x4AD/PAADx4AAAPAAAB5wAAPPwAB5/gAPOPAB4wcAPDBwB4MHAPA4cA4B/gBAH8AAAHAAAAAAAAAAAAAPAAHD/AB/f+AP/x4B4+DwHB4HAcDwcBwHhwHAPHAcAccB4A5wDgB+AGA/4AAH/AAAf+AAAA8AAABgAAAAAfAAAB8AAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/8AD//+A/+/+H4AD98AAB3gAADIAAAAAAAAAAAAAIAAABwAAAXwAAHPwAB8P8D/gP//4AH/8AAAAAAAAAAAAAAAAAAAAAAAAHAAAAcwAAA/gAAb8AAB/gAAH+AAAD+AAAOwAABxAAADAAAAAAAAAAAAAADAAAAMAAAAwAAADAAAAMAAAAwAAB//AAH/8AAAwAAADAAAAMAAAAwAAADAAAAMAAAAAAAAAAAAAABwAAAHIAAAfgAAB8AAAAAAAAAAAAAAAAAAAAAwAAADAAAAMAAAAwAAADAAAAMAAAAwAAADAAAAMAAAAAAAAAAAAAAAAAAAAAAABwAAAHAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAA/wAA//AA//AA//AAH/AAAfAAABAAAAAAAAAAAAAAAAAAAf/wAH//wA///gDgAOAcAAcBwABwHAAHAcAAcBwABwHgAPAPAB4Af//AA//4AA/+AAAAAAAAAAAAAAAAMAAABwAAAOAAAB4AAAH///Af//8B///wAAAAAAAAAAAAAAAAAAAAwAcAPADwB8AfAPAB8B4APwHAB/AcAPcBwB5wHAPHAcB4cA8PBwD/4HAH/AcAHwBwAAAAAAAAAAAAGAHAAcAcAB4BwYDwHDwHAceAcBz4BwHfgHAf3AcB+eDwHw/+AeB/wBwD+AAAAAAAAAAAAAAAAABwAAAfAAAP8AAD/wAA/nAAP4cAD+BwAfgHAB4AcAEA//AAD/8AAP/wAABwAAAHAAAAMAAAAAAAAAAAAAEAH/w4Af/D4B/8HgHDgPAcOAcBw4BwHDgHAcOAcBw8DwHB4eAcH/wBgP+AAAPwAAAAAAAAAAAAAAAB//AAf//AD//+AOHB4Bw4BwHDgHAcOAcBw4BwHDgHAcPA8A4eHgDh/8AEB/gAAD4AAAAAAAAAABwAAAHAAAAcAAMBwADwHAB/AcA/4BwP8AHH/AAd/gAB/wAAH8AAAeAAAAAAAAAAAAAAAEAAPD+AB/f8AP//4B4+DwHDwHAcHAcBwcBwHBwHAcPAcB/+DgD//+AH5/wACB8AAAAAAAAAAAAAAAAEAAAD+AAAf+DAD74OAODw8BwHBwHAOHAcA4cBwDBwHAcHAeBw8A+ePgB//8AD//gAB/wAAAAAAAAAAAAAAAAAAAAAHBwAAcHAABwcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AcgDgB+AOAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAeAAAD8AAAf4AADzwAAeHgADwPAAGAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADGAAAMYAAAxgAADGAAAMYAAAxgAADGAAAMYAAAxgAADGAAAMYAAAxgAADGAAAMYAAAxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABACAAOAcAA8DgAB4cAABzgAAD8AAAHgAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAHgAAA+AAAHgAAAcAAABwD5wHAfnAcD8cBweAAHzwAAP+AAAfwAAAcAAAAAAAAAAAAAAAAAAB/AAA//AAH/+AA8A8AHAA4A4ABwDg+HAcH8OBw444GDBhgYMGGBgwYYHDjjgcP8OBw/44DgDhAOAGAAeAYAA+HgAB/8AAB/gAAAAAAAAAAAAABAAAA8AAAfwAAP/AAH/gAD/4AB/zgAf4OAB8A4AHwDgAf4OAA/84AAP/gAAH/AAAD/gAAB/AAAA8AAAAQAAAAAAAAAB///wH///Af//8BwOBwHA4HAcDgcBwOBwHA4HAcDgcBweBwHj4HAP/58Afz/gAcH8AAAPAAAAAAAH/AAB//AAf//AB4A8APAB4B4ADwHAAHAcAAcBwABwHAAHAcAAcBwABwHAAHAOAA4A8AHgB8B8ADwHgADAYAAAAAAAAAAAAAAAH///Af//8B///wHAAHAcAAcBwABwHAAHAcAAcBwABwHAAHAeAA8A8AHgB8B+AD//gAH/8AAD/AAAAAAAAAAAAAAAAf//8B///wH///AcDgcBwOBwHA4HAcDgcBwOBwHA4HAcDgcBwOBwHAAHAcAAcAAAAAAAAAAAAAAB///wH///Af//8BwOAAHA4AAcDgABwOAAHA4AAcDgABwOAAHAAAAcAAAAAAAAAP/AAB//AAf//AB4A8APAB4B4ADwHAAHAcAAcBwABwHAAHAcAAcBwGBwHgYPAOBg4A+GPgB4f8ADh/gAAH4AAAAAAAAAAAAAAAH///Af//8B///wAA4AAADgAAAOAAAA4AAADgAAAOAAAA4AAADgAAAOAAAA4AAf//8B///wH///AAAAAAAAAAAAAAAAAAAB///wH///Af//8AAAAAAAAAAAABgAAAHgAAAeAAAA8AAABwAAAHAAAAcAAABwH///Af//4B///AAAAAAAAAAAAAAAAAAAAf//8B///wH///AAHgAAA/AAAH+AAA88AAHh8AA8D4AHgDwA8AHgHgAPAYAAcBAAAwAAABAAAAAAAAAAH///Af//8B///wAAAHAAAAcAAABwAAAHAAAAcAAABwAAAHAAAAcAAABwAAAAAAAAAAAAAAH///Af//8B///wB/AAAB/AAAA/AAAA/gAAA/gAAA/gAAA/AAAD8AAA/AAAfwAAH8AAB/AAAfgAAP4AAB///wH///Af//8AAAAAAAAAAAAAAAAAAAH///Af//8B///wD8AAAD4AAAH4AAAHwAAAPwAAAPgAAAPgAAAfAAAAfAAAA/Af//8B///wH///AAAAAAAAAAAH/AAB//AAf//AB4A8APAB4B4ADwHAAHAcAAcBwABwHAAHAcAAcBwABwHAAHAOAA4A8AHgB+D8AD//gAH/8AAD+AAAAAAAAAAAH///Af//8B///wHAOAAcA4ABwDgAHAOAAcA4ABwDgAHAeAAeBwAA+fAAD/4AAD/AAADgAAAAAAAAf8AAH/8AB//8AHgDwA8AHgHgAPAcAAcBwABwHAAHAcAAcBwABwHAAnAcAHcA4AfgDwA+AH4P4AP//wAf/3AAP4AAAAAAAAAAAf//8B///wH///AcA4ABwDgAHAOAAcA4ABwDgAHAOAAcB+AB4H+AD59/AP/h8AP8BwAOABAAAAAAAAAAAAAwAD4HwA/4fAD/geAePA8BwcBwHBwHAcDgcBwOBwHA4HAcDgcA4HDwD4eeAHw/4AOD/AAIDwAAAAABwAAAHAAAAcAAABwAAAHAAAAcAAABwAAAH///Af//8B///wHAAAAcAAABwAAAHAAAAcAAABwAAAGAAAAAAAAAAAAAH//wAf//gB///AAAAeAAAA8AAABwAAAHAAAAcAAABwAAAHAAAAcAAADgAAAeAf//wB//+AH//gAAAAAAAAAAGAAAAfAAAB/gAAB/wAAA/4AAAf8AAAP/AAAH8AAADwAAA/AAAf8AAP+AAP/AAH/gAB/wAAH4AAAcAAABAAAAHwAAAf4AAA/+AAAP/gAAH/wAAB/wAAA/AAAf8AAf/AAP/gAP/gAB/gAAH4AAAf+AAAf/AAAH/wAAB/8AAAfwAAB/AAB/8AA/+AA/+AAf+AAB/AAAHAAAAAAAAAAAAQGAADAeAA8B8AHwD8B+AD4PgAH74AAH/AAAPwAAA/gAAP/gAD8fAAfA/AH4A+AeAA8BwABwEAABAQAAABwAAAHwAAAPwAAAfwAAAfgAAAfgAAAf/wAB//AAf/8AH8AAA/AAAPwAAB8AAAHAAAAQAAAAAAAAAAABAcAAcBwADwHAA/AcAP8BwD/wHAfnAcH4cBx+BwHPwHAf8AcB/ABwH4AHAeAAcBgABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////////gAAAOAAAA4AAADAAAAAAAAAAAAAAAAAAAAAAAeAAAB/gAAH/4AAB/+AAAf/gAAH/AAAB8AAAAQAAAAAAAAAAAAAAOAAAA4AAADgAAAP/////////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAADgAAAcAAADgAAAcAAADgAAAcAAAB4AAADwAAADgAAAHAAAAOAAAAYAAAAAAAAAAAAAAAAAAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAYAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAADj+AAef8AD5xwAOGHAA44MADjgwAOOHAA44YADjDgAH/8AAf/8AAf/wAAAAAAAAAAAAAAAAAAAf//8B///wH//+AAcA4ADgBwAOAHAA4AcADgBwAOAHAA8A8AB8PgAD/8AAH/gAAH4AAAAAAAAAAAAH4AAB/4AAP/wAB4HgAPAPAA4AcADgBwAOAHAA4AcADgBwAPAPAAeB4AA4HAABgYAAAAAAAAAAAAfgAAH/gAB//gAHgeAA8A8ADgBwAOAHAA4AcADgBwAOAHAAcA4B///wH///Af//8AAAAAAAAAAAAAAAAH4AAB/4AAP/wAB7HgAPMPAA4wcADjBwAOMHAA4wcADjBwAPMPAAfx4AA/HAAB8YAAAwAAAAAAAAAAAAwAAADAAAB///AP//8B///wHMAAAYwAABjAAAGMAAAAAAAAAPwAAD/wMA//w4DwPHgeAePBwA4cHADhwcAOHBwA4cHADhwOAcPB///4H///Af//wAAAAAAAAAAAAAAAAAAB///wH///AAf/8ABwAAAOAAAA4AAADgAAAOAAAA4AAADwAAAH//AAP/8AAf/wAAAAAAAAAAAAAAAAAAAc//8Bz//wHP//AAAAAAAAAAAAAAHAAAAcAAAH+f///5///7H//8AAAAAAAAAAAAAAH///Af//8B///wAAPAAAB+AAAP8AAB54AAfDwAD4HgAOAPAAwAcACAAwAAAAAAAAAB///wH///Af//8AAAAAAAAAAAAAAAAAAAAP//AA//8AB//wAHAAAA4AAADgAAAOAAAA4AAAD4AAAH//AAP/8AB//wAHAAAA4AAADgAAAOAAAA4AAADwAAAH//AAP/8AAf/wAAAAAAAAAAAAAAAP//AA//8AB//wAHAAAA4AAADgAAAOAAAA4AAADgAAAPAAAAf/8AA//wAB//AAAAAAAAAAAAAAAAB+AAAf+AAD/8AAeB4ADwDwAOAHAA4AcADgBwAOAHAA4AcADwDwAHw+AAP/wAAf+AAAfgAAAAAAAAAAAAAAAB///8H///wP///A4BwAHADgAcAOABwA4AHADgAcAOAB4B4AD4fAAH/4AAP/AAAPwAAAAAAAAAAAAPwAAD/wAA//wADwPAAeAeABwA4AHADgAcAOABwA4AHADgAOAcAB///8H///wf///AAAAAAAAAAAAAAAAAAAD//wAP//AAf/8ABwAAAOAAAA4AAADgAAAOAAAAAAAAAYGAAD4cAAfx4AD3DwAOOHAA44cADjhwAOGHAA4ccADxzwAHj+AAOP4AAYOAAAAAAAwAAADAAAAMAAAP//wA///gD///AAwAcADABwAMAHAAwAcADAAwAAAAAAAAAAD/gAAP/4AA//4AAA/gAAAPAAAAcAAABwAAAHAAAAcAAABwAAAOAA//8AD//wAP//AAAAAAAAAAAIAAAA4AAAD8AAAH+AAAH/AAAD/gAAB/AAAB8AAA/wAAf8AAP+AAD/AAAPgAAAwAAAAAAAAIAAAA8AAAD/AAAH/gAAD/wAAA/wAAA/AAAf8AAP+AAP+AAA/AAAD+AAAH/AAAD/gAAA/wAAA/AAAf8AAP/AAP/AAA/gAADgAAAAAAAAAAEADAAwAOAHAA+B8AB8PgAB74AAD/AAAH4AAA/wAAHvgAB8PgAPgfAA4AcADAAwAAABABAAAAHAAAAfgAAA/wAAA/wAwAf4fAAP/8AAP/AAB/gAA/wAAf4AAP+AAB/AAAHgAAAQAAAAAAEADAAwAOAPAA4B8ADgPwAOD/AA4ecADnxwAO8HAA/gcAD8BwAPAHAA4AcACAAwAAAAAAAAAAAAAAAAAAAAAAAAAA8AB////f//////n/+AAAA4AAADgAAAAAAAAAAAAAAAAAH///Af//8B///wAAAAAAAAAAAAAAAAAAA4AAADgAAAOAAAA//5/9////z////AAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAB8AAAHwAAAcAAABwAAAHgAAAOAAAA8AAABwAAAHAAAB8AAAHwAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAGAAABwAAAOAAABwAAAHAAAAcAAAA4AAABwAAABgAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAOAB4B4ADwPAAHh4AAPPAAAf4AAA/AAAB4AAAPwAAB/gAAPPAAB4eAAPA8AB4B4AHADgAIAEAAAAAAADAAAAMAAAAwAAADAAAAMAAAAwAAHDDgA8MPADww8AGDBgAAMAAAAwAAADAAAAMAAAAwAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADn//gOf/+A5//4AAAAAAAAAAAAAAAAAAAD/AAA//AAH/+AA+B8ADgBwAOAHAHwAPgfAA+B8AD4A4AcADwDwAHgeAAOBwAAQCAAAAAAAAAAAADgcAAOBwAA4HAD//8A///wD///AeDgcBwOBwHA4HAcDgcB4GBwD4AHAHgAcAOAAAAAAAAAAAAAMAGAB7+8AD//gAHx8AAcBwADgDgAOAOAA4A4ADgDgAOAOAA4A4ABwHAAHg8AA//4AH//wAMOGAAAAAAQAAABwAAAHwMYAPwxgAfjGAAfsYAAf7gAAf/wAB//AAf/8AH7GAA/MYAPwxgB8DGAHAAAAQAAAAAAAAAAAAAf/D/5/8P/n/w/+AAAAAAAAAAAAAAAAAAAABwAAffhwD//Hgf+cfBzwwcGHDhwYcOHBxw4cHDhxwfOPvA8//4Bx//AADwwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAP/wAB//gAPAPAB4AOAPDw8A4/xwHH/jgc4HOBzgc4HMAzgcwDOBzgc4HPDjgOcOeA4whwBwAOAHwD4APw/AAf/4AAf+AAAPAAAAAAAATgAAD/AAANsAAA2wAADTAAAP8AAAfwAAAAAAAAAAAAAAAAAAgAAAPAAAB+AAAOeAADw8AAOIwAADxAAAfgAADngAA8PAADgMAAEAQAAAAAAAAAAABgAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAYAAAB+AAAH4AAAAAAAAAAAAAAAAAAAAD8AAA/8AAHh4AAYDgAD/3AAN/MAA0QwADRjAAN/MAA7hwABwOAADhwAAH+AAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfgAAD/AAAeeAABw4AAGDgAAYOAABw4AAH/AAAP8AAAfAAAAAAAAAAAAAAAAAAAwYAADBgAAMGAAAwYAADBgAAMGAAP+YAA/5gAD/mAAAwYAADBgAAMGAAAwYAADBgAAAAAAAAAAAAAAAMDAABwcAAPDwAAwPAADB8AAMOwAA5zAAB+MAADwwAAAAAAAAAAAIBAAAwGAADMcAANwwAA/DAAD8MAAO/wAAx+AAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///B///8H//AAAAeAAAA4AAADgAAAOAAAA4AAADgAAAcAB//gAH//gAf/+AAAAAAAAAAAAAAAAAAAAP4AAB/4AAP/gAB//AAH/8AAf/wAB//AAH///8f///x////AAAAAAAAAB////H///8f///wAAAAAAAAAAAAAAABAAAAOAAAB4AAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAzAAAPMAAA/wAAAeAAAAAAAAAAAAAAAAAAAIAAABgAAAMAAAA//AAD/8AAAAAAAAAAAAAAAAAAAAAA8AAAP4AAAwwAADDAAAMMAAA5wAAB+AAADwAAAAAAAAAAAAAAAAAMAwAA8HAAB44AAD/AAAD4AADGMAAOBwAAeOAAA/wAAA+AAABgAAAAAAAAAAAAAAABAAAAMAAABwAAAH/8CAf/wcAAAHgAAA8AAAHgAAB4AAAPAAAB4AAAeAAADwAAA+AAAHgCAA8A8APAfwB4H7AHB+MAAHAwAAQ/wAAD/AAAAwAAADAAAAAAAAAAAAAAAAAAAAEAAAAwAAAHAAAAf/wIB//BwAAAeAAADwAAAeAAAHgAAA8AAAHgAAB4AAAPAAAD4AAAeAAADwAAA8GAwHg4HAcHA8AAYHwABg7AAGHMAAf4wAA/DAAA4MAAAAAAAAAAYBgABgHAAGMOAAZwYABvBgAH8OCAe/wcBx+HgABg8AAAHgAAB4AAAPAAAB4AAAeAAADwAAA+AAAHgHAA8B8APAfwB4HzADB8MAAHAwAAQ/wAAD/AAAAwAAAAAAAAAAAAAAAAAA4AAAP4AAB/wAAPHgABwOA4/A4Dn4DgOfAOAAAA4AAAHgAAB8AAAHgAAAYAAAAAAAAEAAADwAAB/AAA/8AAf+AAP/gAH/OAB/g4AHwDgAfAOAB/g4AD/zgAA/+AAAf8AAAP+AAAH8AAADwAAABAAAAEAAADwAAB/AAA/8AAf+AAP/gAH/OAB/g4AHwDgAfAOAB/g4AD/zgAA/+AAAf8AAAP+AAAH8AAADwAAABAAAAEAAADwAAB/AAA/8AAf+AAP/gAH/OAB/g4AHwDgAfAOAB/g4AD/zgAA/+AAAf8AAAP+AAAH8AAADwAAABAAAAEAAADwAAB/AAA/8AAf+AAP/gAH/OAB/g4AHwDgAfAOAB/g4AD/zgAA/+AAAf8AAAP+AAAH8AAADwAAABAAAAEAAADwAAB/AAA/8AAf+AAP/gAH/OAB/g4AHwDgAfAOAB/g4AD/zgAA/+AAAf8AAAP+AAAH8AAADwAAABAAAAAAAAABwAAA/AAAf8AAP/AAH/wfD/nD+/wcMb4BwxvgHD+/wcHx/5wEAf/AAAP+AAAH/AAAD8AAABwAAAAAAAEAAADwAAB/AAA/8AAf+AAP/gAH/OAB/g4AHwDgAcAOABwA4AHADgAf//8B///wHA4HAcDgcBwOBwHA4HAcDgcBwOBwHA4HAcDgcBwOBwHAAHAYAAMAAAAAAAAAAA/4AAP/4AD//4APAHgB4APAPAAeA4AA4DgADg+AAPz4AA//gAD/+AAOe4AA4BwAHAHgA8APgPgAeA8AAYDAAAAAAAAAAAAAAAAf//8B///wH///AcDgcBwOBwHA4HAcDgcBwOBwHA4HAcDgcBwOBwHAAHAcAAcAAAAAAAAAAAAAAB///wH///Af//8BwOBwHA4HAcDgcBwOBwHA4HAcDgcBwOBwHA4HAcAAcBwABwAAAAAAAAAAAAAAH///Af//8B///wHA4HAcDgcBwOBwHA4HAcDgcBwOBwHA4HAcDgcBwABwHAAHAAAAAAAAAAAAAAAf//8B///wH///AcDgcBwOBwHA4HAcDgcBwOBwHA4HAcDgcBwOBwHAAHAcAAcAAAAAAAAAAAAAAB///wH///Af//8AAAAAAAAAAAAAAAAAAAH///Af//8B///wAAAAAAAAAAAAAAAAAAAf//8B///wH///AAAAAAAAAAAAAAAAAAAB///wH///Af//8AAAAAAAAAAABgAAAGAAH///Af//8B///wHAYHAcBgcBwGBwHAYHAcBgcBwABwHAAHAeAA8A8AHgB+D8AD//gAH/8AAD+AAAAAAAAAAAAAAAAf//8B///wH///APwAAAPgAAAfgAAAfAAAA/AAAA+AAAA+AAAB8AAAB8AAAD8B///wH///Af//8AAAAAAAAAAAf8AAH/8AB//8AHgDwA8AHgHgAPAcAAcBwABwHAAHAcAAcBwABwHAAHAcAAcA4ADgDwAeAH4PwAP/+AAf/wAAP4AAAAAAAH/AAB//AAf//AB4A8APAB4B4ADwHAAHAcAAcBwABwHAAHAcAAcBwABwHAAHAOAA4A8AHgB+D8AD//gAH/8AAD+AAAAAAAB/wAAf/wAH//wAeAPADwAeAeAA8BwABwHAAHAcAAcBwABwHAAHAcAAcBwABwDgAOAPAB4Afg/AA//4AB//AAA/gAAAAAAAf8AAH/8AB//8AHgDwA8AHgHgAPAcAAcBwABwHAAHAcAAcBwABwHAAHAcAAcA4ADgDwAeAH4PwAP/+AAf/wAAP4AAAAAAAH/AAB//AAf//AB4A8APAB4B4ADwHAAHAcAAcBwABwHAAHAcAAcBwABwHAAHAOAA4A8AHgB+D8AD//gAH/8AAD+AAAAAAAAAAAAGDgAA8eAAB7wAAD+AAAHwAAAfAAAD+AAAe8AADw4AAGBAAAAAAAAAAAAAAAAAf8MAH//4B///AHgD4A8AfgHgD/AcAecBwDxwHAeHAcDwcBw+BwHHgHAc8AcA/gDgD8AeAH4PwA//+AH//wAMP4AAAAAAAAAAAf//AB//+AH//8AAAB4AAADwAAAHAAAAcAAABwAAAHAAAAcAAABwAAAOAAAB4B///AH//4Af/+AAAAAAAAAAAAAAAAAAAAH//wAf//gB///AAAAeAAAA8AAABwAAAHAAAAcAAABwAAAHAAAAcAAADgAAAeAf//wB//+AH//gAAAAAAAAAAAAAAAAAAAB//8AH//4Af//wAAAHgAAAPAAAAcAAABwAAAHAAAAcAAABwAAAHAAAA4AAAHgH//8Af//gB//4AAAAAAAAAAAAAAAAAAAAf//AB//+AH//8AAAB4AAADwAAAHAAAAcAAABwAAAHAAAAcAAABwAAAOAAAB4B///AH//4Af/+AAAAAAAAAAAQAAABwAAAHwAAAPwAAAfwAAAfgAAAfgAAAf/wAB//AAf/8AH8AAA/AAAPwAAB8AAAHAAAAQAAAAAAAAAAAAAf//8B///wH///ABwHAAHAcAAcBwABwHAAHAcAAcBwABwHAAHg8AAP/gAAf8AAA/gAAAAAAAAAAAAAAAA///AP//8A///wHgAAAcAAcBwABwHBwHAcHAcB4+BwD/4PAH954APn/gAAP8AAAOAAAAAAAAAAAAAD4AAcfwADz/gAfOOCBww4PHHBg+ccGAZxw4AHHDAAcYcAA//gAD//gAD/+AAAAAAAAAAAAAAAAAPgABx/AAPP+AB844AHDDgAccGAZxwYPnHDg8ccMDBxhwAD/+AAP/+AAP/4AAAAAAAAAAAAAAAAA+AAHH8AA8/4BnzjgOcMOBxxwYOHHBg4ccOBxxwwDnGHAGP/4AA//4AA//gAAAAAAAAAAAAAAAAHwAA4/gAHn/A8+ccDzhhwMOODA444MBjjhwHOOGAM4w4Dx//AOH//AAH/8AAAAAAAAAAAAAAAAAfAADj+AAef8Bz5xwHOGHAc44MADjgwAOOHAY44YBzjDgHH/8AAf/8AAf/wAAAAAAAAAAAAAAAAAfAADj+AAef8AD5xweOGHD844MMzjgwzOOHD844YHjjDgAH/8AAf/8AAf/wAAAAAAAAAAAAAAAAHwAAx/gAHn/AAc4cADjhwAOMDAA4wcADjBwAOMHAA4w4AB//AAH/4AAP/wAB/fgAPMPAA4wcADjBwAOMHAA4wcADjBwAPMPAAfx4AA/HAAB8YAAAAAAAAAAAA/AAAP/AAB/+AAPA8AB4B4AHADgwcAPzBwA/8HADngcAOMB4B4ADwPAAHA4AAMDAAAAAAAAAAAAA/AAAP/AAB/+AAPY8AB5h4OHGDg+cYOB5xg4AnGDgAcYOAB5h4AD+PAAH44AAPjAAAGAAAAAAAAAAAAAPwAAD/wAAf/gAD2PAAeYeABxg4AHGDgOcYOD5xg4OHGDggeYeAA/jwAB+OAAD4wAABgAAAAAAAAAAAAD8AAA/8AAH/4AY9jwDnmHgecYODhxg4OHGDg8cYOB5xg4BnmHgCP48AAfjgAA+MAAAYAAAAAAAAAAAAB+AAAf+AAD/8Acex4BzzDwHOMHAA4wcADjBwAOMHAc4wcBzzDwGH8eAAPxwAAfGAAAMAAAAAAAAAAAOAAAA+f/+A5//4An//gAAAAAAAAAAAAAAAAAAAJ//4Dn//g+f/+DgAAAAAAAAMAAABwAAAOP//Aw//8Dj//wHAAAAMAAABwAAAHAAAAA//8AD//wAP//AcAAABwAAAAAAAAAA/gAAP/AAB//AAPA8AA4A4DDgDgPMAOA/wA4D7ADgPOAOB+8B4C/+/AA//4AB//AAAHAAAAAAAAAAAAP//AA//8Bx//wPHAAAw4AADjgAAGOAAAc4AAAzgAAPPAAA4f/8AA//wAB//AAAAAAAAAAAAAAAAA/AAAP/AAB/+AAPA8CB4B4OHADg+cAOA5wA4AHADgAcAOAB4B4AD4fAAH/4AAP/AAAPwAAAAAAAAAAAAPwAAD/wAAf/gADwPAAeAeABwA4AnADgecAOD5wA4OHADgAeAeAA+HwAB/+AAD/wAAD8AAAAAAAAAAAAD8AAA/8AAH/4AY8DwDngHgecAODhwA4OHADg8cAOB5wA4BngHgCPh8AAf/gAA/8AAA/AAAAAAAAAAAAB+AAAf+AAD/8AceB4DzwDwMOAHA44AcBjgBwHOAHAM4AcDzwDwOHw+AAP/wAAf+AAAfgAAAAAAAAAAAAfgAAH/gAA//AHHgeAc8A8BzgBwAOAHAA4AcADgBwHOAHAc8A8Bh8PgAD/8AAH/gAAH4AAAAAAAAAAAAMAAAAwAAADAAAAMAAAAwAAADAAADtwAAO3AAA7cAAAMAAAAwAAADAAAAMAAAAAAAAAAAAAH5gAB//AAP/4AB4PgAPB/AA4PcADh5wAOPHAA54cADvBwAP4PAAfD4AB//AAP/4AAZ+AAAAAAAAAAAAf8AAB//AAH//AAAH8AAAB4OAADg+AAOB4AA4AgADgAAAOAAABwAH//gAf/+AB//4AAAAAAAAAAAAAAAH/AAAf/wAB//wAAB/AAAAeAAAA4BgADgeAAOD4AA4MAADgAAAcAB//4AH//gAf/+AAAAAAAAAAAAAAAB/wAAH/8AAf/8AYAfwDgAHgcAAODgAA4OAADg8AAOB4AA4BgAHACf/+AB//4AH//gAAAAAAAAAAAAAAA/4AAD/+AAP/+AcAP4BwADwHAAHAAAAcAAABwAAAHAcAAcBwADgGP//AA//8AD//wAAAAAAAAAABAAAAHAAAAfgAAA/wAAA/wAAAf4cAAP/zgAP/+AB/jgA/wAAf4AAP+AAB/AAAHgAAAQAAAAAAAAAAAA//////////////A4BwAHADgAcAOABwA4AHADgAcAOAB4B4AD4fAAH/4AAP/AAAPwAAAAAABAAAAHAAAAfgAAw/wADg/wA+Af4fAAP/8AAP/AAB/g4A/wDgf4AOP+AAB/AAAHgAAAQAAA=='),
    32,
    atob("BgkMGhEZEgYMDAwQCAwICxILEBAREBEOEREJCREVEQ8ZEhEUExAOFBQHDREPGBMUERQSEhEUERsREBIMCwwTEg4QERAREQoREQcHDgcYEREREQoPDBEPFg8PDwwIDBMcCgoAAAAAAAAAAAAAACERESEAAAAAAAAAAAAAAAAhIQAGCRAQEhAIDw8XCQ8RABIODRELCw4REwcLCQoPHBscDxISEhISEhoUEBAQEAcHBwcTExQUFBQUDhQUFBQUEBEREBAQEBAQGhARERERBwcHBxAREREREREPEREREREPEQ8="),
    28+(scale<<8)+(1<<16)
  );
  return this;
};

Graphics.prototype.setMiniFont = function(scale) {
  // Actual height 16 (15 - 0)
  this.setFontCustom(
    atob('AAAAAAAAAAAAAP+w/5AAAAAA4ADgAOAA4AAAAAAAAAABgBmAGbAb8D+A+YDZ8B/wf4D5gJmAGQAQAAAAAAAeOD8cMwzxj/GPMYwc/Az4AAAAAHAA+DDIYMjA+YBzAAYADeA7MHMw4zDD4ADAAAAz4H/wzjDHMMMwwbBj4APgADAAAAAA4ADgAAAAAAAAAAfwH/54B+ABAAAAAOABeAcf/gfwAAAAACAAaAD4APgAOABgAAAAAAACAAIAAgA/wAMAAgACAAAAAAAAPAA4AAAAAAIAAgACAAIAAgAAAAAAADAAMAAAAAAAcAfwf4D4AIAAAAA/wH/gwDDAMMAwwDB/4D/AAAAAAGAAwAD/8P/wAAAAAHAw8HDA8MHww7DnMH4wGBAAAMBgyHDcMPww/DDv4MfAAAAAAAHgD+A+YPhgwGAH8AfwAEAAAAAA/GD8cMwwzDDMMM5wx+ABgAAAP8B/4MwwzDDMMMwwx+ADwAAAgADAAMBwwfDPgP4A8ADAAAAAe+D/8M4wxjDGMP5wf+ABwAAAfAB+cMYwwjDCMMYwf+A/wAAAAAAAAAxgBCAAAAAAAAAYPBA4AAAAAAAAAgAHAA+AHMAYYAAAAAAAAAAAAAAJAAkACQAJAAkACQAJAAkAAAAAAAAAAAAAABhgHMAPgAcAAgAAAAAAAABgAOAAwbDDsMYA/AA4AAAAAAAD4A/wGBgxzDPsMyQjJDPkM+wYIBxgD+AAAAAAABAA8A/gf8DwwODA/sAfwAHwADAAAP/w//DGMMYwxjDOMP9we+ABwA8AP8Bw4MAwwDDAMMAwwDDgcHDgMMAAAAAA//D/8MAwwDDAMMAw4HB/4D/AAAAAAP/w//DGMMYwxjDGMMQwgBAAAP/w//DDAMMAwwDDAMAADwA/wHDgwDDAMMAwwDDCMOJwc+ADwAAA//D/8AMAAwADAAMAAwD/8P/wAAAAAP/w//AAAABgAHAAMAAwAHD/4P+AAAAAAP/w//AOAB+AOcBw4MBwgDAAEAAA//D/8AAwADAAMAAwADAAAP/w//A8AA8AA+AA8AHwB8AeAHgA//D/8AAAAAD/8P/wcAAcAA8AA4AB4P/w//AAAA8AP8Bw4MAwwDDAMMAwwDDgcH/gP8AAAAAA//D/8MMAwwDDAMYA7gB8ABgADwA/wHDgwDDAMMAwwDDA8ODwf/A/8AAAAAD/8P/wwwDDAMMAx4Dv4HxwEBAAAHjg/HDMMMYwxjDGMONwc+ABwMAAwADAAMAA//D/8MAAwADAAIAAAAD/wP/gAHAAMAAwADAAMAHg/8AAAMAA+AA/AAfgAPAA8AfgPwD4AMAAwAD4AD+AA/AA8A/g/gDwAP4AH8AB8APwH8D8AMAAgBDAMPDgO8APAB8AOcDw8MAwgBCAAOAAeAAeAAfwH/B4AOAAwAAAAMAwwPDB8Mew3jD4MPAwwDAAAAAAAAB//3//QABAAAAAAADgAP4AH+AB8AAQAABAAEAAf/9//wAAAAAAAAAAGAAwAGAAwABgADAAGAAAAAAAAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAQA3wHbAZMBswGzAf4A/wAAAAAP/w//AYMBgwGDAYMA/gB8AAAAEAD+Ae8BgwGDAYMBgwDGAAAAMAD+Ae8BgwGDAYMBhw//D/8AAAAYAP4B/wGTAZMBkwGTAP4AcAEAAYAP/w//CQAJAAAwAP4hz3GDMQMxAzGHcf/h/8AAAAAP/w//AYABgAGAAYAA/wB/AAAAAA3/Df8AAAAAOf/9//AAAAAP/w//ADgAfADGAYMBAQAAD/8P/wAAAAAB/wH/AYABgAGAAf8A/wGAAYABgAH/AP8AAAAAAf8B/wGAAYABgAGAAP8AfwAAADAA/gHvAYMBgwGDAYMA/gB8AAAAAAH/8f/xgwGDAYMBgwD+AHwAAAAwAP4B7wGDAYMBgwGHAf/x//AAAAAB/wH/AYABgAEAAAAA5gHzAbMBkwGbAd8AzgEAAYAP/wf/AQMBAwAAAAAB/gH/AAMAAwADAAcB/wH/AAABAAHgAPwAHwAPAH4B8AGAAQAB8AB+AA8APwHwAeAA/AAPAD8B+AHAAQEBgwHOAHwAOAD+AccBAwAAAQAB4AD4EB/wB8A/APgBwAAAAAEBgwGPAZ8B8wHjAcMBAQAAAAAABgf/9/n2AAAAAAAP/w//AAAEAAYAB/nz//AGAAAAAAAAAAAAcABgAGAAcAAwAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    32,
    atob("AwUHDwoOCwQHBwcJBAcEBgoGCQkKCQoICQoFBQoMCgkPCgoMCwkICwsECAoIDgsMCgwKCgoLCg8KCQoHBgcLCwgJCgkKCQYKCgQECAQOCgoKCgYIBwoIDAkJCAcEBwsQ"),
    16+(scale<<8)+(1<<16)
  );
  return this;
};

let imgLock = function() {
  return {
    width : 16, height : 16, bpp : 1,
    transparent : 0,
    buffer : E.toArrayBuffer(atob("A8AH4A5wDDAYGBgYP/w//D/8Pnw+fD58Pnw//D/8P/w="))
  };
};


/************************************************
 * Menu
 */
let clockInfoItems = clock_info.load();
let clockInfoMenu = clock_info.addInteractive(clockInfoItems, {
  x : 0,
  y: 135,
  w: W,
  h: H-135,
  draw : (itm, info, options) => {
    g.setColor(g.theme.fg);
    g.fillRect(options.x, options.y, options.x+options.w, options.y+options.h);

    g.setFontAlign(0,0);
    g.setColor(g.theme.bg);

    if (options.focus){
      g.drawRect(options.x, options.y, options.x+options.w-2, options.y+options.h-1); // show if focused
      g.drawRect(options.x+1, options.y+1, options.x+options.w-3, options.y+options.h-2); // show if focused
    }

    // Set text and font
    var image = info.img;
    var text = String(info.text);
    if(text.split('\n').length > 1){
      g.setMiniFont();
    } else {
      g.setSmallFont();
    }

    // Compute sizes
    var strWidth = g.stringWidth(text);
    var imgWidth = image == null ? 0 : 24;
    var midx = options.x+options.w/2;

    // Draw

    if (image) {
      var scale = imgWidth / image.width;
      g.drawImage(image, midx-16-parseInt(strWidth/2), options.y+8, {scale: scale});
    }
    g.drawString(text, midx+imgWidth-6, options.y+20);
  }
});


/************************************************
 * Draw
 */
let draw = function() {
  // Queue draw again
  queueDraw();

  // Draw clock
  drawDate();
  drawTime();
  drawLock();
  drawWidgets();
};


let drawDate = function() {
    // Draw background
    var y = getLineY()
    g.reset().clearRect(0,0,W,y);

    // Draw date
    y = parseInt(y/2)+4;
    y += isFullscreen() ? 0 : 8;
    var date = new Date();
    var dateStr = date.getDate();
    dateStr = ("0" + dateStr).substr(-2);
    g.setMediumFont();  // Needed to compute the width correctly
    var dateW = g.stringWidth(dateStr);

    g.setSmallFont();
    var dayStr = locale.dow(date, true);
    var monthStr = locale.month(date, 1);
    var dayW = Math.max(g.stringWidth(dayStr), g.stringWidth(monthStr));
    var fullDateW = dateW + 10 + dayW;

    g.setFontAlign(-1,0);
    g.drawString(dayStr, W/2 - fullDateW/2 + 10 + dateW, y-12);
    g.drawString(monthStr, W/2 - fullDateW/2 + 10 + dateW, y+11);

    g.setMediumFont();
    g.setColor(g.theme.fg);
    g.drawString(dateStr, W/2 - fullDateW / 2, y+2);
};


let drawTime = function() {
  // Draw background
  var y1 = getLineY();
  var y = y1;
  var date = new Date();

  var hours = String(date.getHours());
  var minutes = date.getMinutes();
  minutes = minutes < 10 ? String("0") + minutes : minutes;
  var colon = settings.hideColon ? "" : ":";
  var timeStr = hours + colon + minutes;

  // Set y coordinates correctly
  y += parseInt((H - y)/2)-10;

  // Clear region
  g.setColor(g.theme.fg);
  g.fillRect(0,y1,W,y+20);

  g.setMediumFont();
  g.setColor(g.theme.bg);
  g.setFontAlign(0,0);
  g.drawString(timeStr, W/2, y);
};


let drawLock = function() {
  if(settings.showLock && Bangle.isLocked()){
    g.setColor(g.theme.fg);
    g.drawImage(imgLock(), W-16, 2);
  }
};


let drawWidgets = function() {
  if(isFullscreen()){
    for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
  } else {
    Bangle.drawWidgets();
  }
};


/************************************************
 * Listener
 */
// timeout used to update every minute
let drawTimeout;

// schedule a draw for the next minute
let queueDraw = function() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};


// Stop updates when LCD is off, restart when on
let lcdListenerBw = function(on) {
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
};
Bangle.on('lcdPower', lcdListenerBw);

let lockListenerBw = function(isLocked) {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;

  if(!isLocked && settings.screen.toLowerCase() == "dynamic"){
    // If we have to show the widgets again, we load it from our
    // cache and not through Bangle.loadWidgets as its much faster!
    for (let wd of WIDGETS) {wd.draw=wd._draw;wd.area=wd._area;}
  }

  draw();
};
Bangle.on('lock', lockListenerBw);


let kill = function(){
  clockInfoMenu.remove();
  delete clockInfoMenu;
};
E.on("kill", kill);

/************************************************
 * Startup Clock
 */

// The upper part is inverse i.e. light if dark and dark if light theme
// is enabled. In order to draw the widgets correctly, we invert the
// dark/light theme as well as the colors.
let themeBackup = g.theme;
g.setTheme({bg:g.theme.fg,fg:g.theme.bg, dark:!g.theme.dark}).clear();

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    Bangle.removeListener('lcdPower', lcdListenerBw);
    Bangle.removeListener('lock', lockListenerBw);
    Bangle.removeListener('charging', chargingListenerBw);
    Bangle.removeListener('touch', touchListenerBw);
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    // save settings
    save();
    E.removeListener("kill", save);
    g.setTheme(themeBackup);
  }
});

// Load widgets and draw clock the first time
Bangle.loadWidgets();

// Cache draw function for dynamic screen to hide / show widgets
// Bangle.loadWidgets() could also be called later on but its much slower!
for (let wd of WIDGETS) {wd._draw=wd.draw; wd._area=wd.area;}

// Draw first time
draw();

} // End of app scope
