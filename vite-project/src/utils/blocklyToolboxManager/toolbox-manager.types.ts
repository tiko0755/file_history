// 类型定义文件: toolbox-manager.types.ts
import * as Blockly from "blockly";

/**
 * 块配置接口
 */
export interface BlockConfig {
  kind: "block";
  type: string;
  inputs?: Record<string, any>;
  fields?: Record<string, any>;
  disabled?: boolean;
  [key: string]: any;
}

/**
 * 分隔符配置接口
 */
export interface SeparatorConfig {
  kind: "sep";
  gap?: number;
  cssConfig?: any;
}

/**
 * 标签配置接口
 */
export interface LabelConfig {
  kind: "label";
  text: string;
  webClass?: string;
}

/**
 * 按钮配置接口
 */
export interface ButtonConfig {
  kind: "button";
  text: string;
  callbackKey: string;
  webClass?: string;
}

/**
 * 分类配置接口
 */
export interface CategoryConfig {
  kind: "category";
  name: string;
  colour?: string | number;
  contents: Array<BlockConfig | SeparatorConfig | LabelConfig | ButtonConfig>;
  custom?: string;
  categorystyle?: string;
  cssConfig?: any;
  expanded?: boolean;
  hidden?: boolean;
}

/**
 * 工具箱配置接口
 */
export interface ToolboxConfig {
  kind: "categoryToolbox";
  contents: CategoryConfig[];
}

export interface FlyoutToolboxConfig {
  kind: "flyoutToolbox";
  contents: Array<BlockConfig | SeparatorConfig | LabelConfig | ButtonConfig>;
}

/**
 * 分类样式配置
 */
export interface CategoryStyle {
  colour?: string | number;
  cssConfig?: any;
  categorystyle?: string;
}

/**
 * 工具箱事件类型
 */
export type ToolboxEvent =
  | "categoryAdded"
  | "categoryRemoved"
  | "blockAdded"
  | "blockRemoved"
  | "categoriesReordered"
  | "categoryStyleUpdated"
  | "toolboxImported"
  | "toolboxCleared";

/**
 * 工具箱事件数据
 */
export interface ToolboxEventData {
  categoryAdded: { name: string; category: CategoryConfig };
  categoryRemoved: { name: string };
  blockAdded: { categoryName: string; block: BlockConfig | string };
  blockRemoved: { categoryName: string; blockType: string };
  categoriesReordered: { categoryNames: string[] };
  categoryStyleUpdated: { categoryName: string; style: CategoryStyle };
  toolboxImported: { config: ToolboxConfig };
  toolboxCleared: {};
}

/**
 * 事件监听器类型
 */
export type ToolboxEventListener<T extends ToolboxEvent = ToolboxEvent> = (
  event: T,
  data: ToolboxEventData[T],
) => void;

/**
 * 块信息接口（用于搜索）
 */
export interface BlockInfo {
  type: string;
  category: string;
  name: string;
  colour?: string | number;
}
