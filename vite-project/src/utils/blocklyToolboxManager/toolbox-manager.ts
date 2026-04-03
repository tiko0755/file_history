// toolbox-manager.ts
import * as Blockly from "blockly";
import {
  BlockConfig,
  CategoryConfig,
  ToolboxConfig,
  CategoryStyle,
  ToolboxEvent,
  ToolboxEventData,
  ToolboxEventListener,
  BlockInfo,
} from "./toolbox-manager.types";

/**
 * Blockly Toolbox 管理器
 * 提供工具箱的动态管理和配置功能
 */
export class ToolboxManager {
  protected workspace: Blockly.WorkspaceSvg;
  protected toolbox: Blockly.IToolbox | null;
  protected categories: Map<string, CategoryConfig>;
  protected listeners: Set<ToolboxEventListener>;

  /**
   * 构造函数
   * @param workspace Blockly工作区实例
   */
  constructor(workspace: Blockly.WorkspaceSvg) {
    this.workspace = workspace;
    this.toolbox = workspace.getToolbox();
    this.categories = new Map<string, CategoryConfig>();
    this.listeners = new Set<ToolboxEventListener>();
  }

  /**
   * 初始化工具箱配置
   * @param toolboxConfig 工具箱配置
   */
  public initialize(toolboxConfig?: ToolboxConfig): void {
    if (!toolboxConfig) return;

    // 清空现有分类
    this.categories.clear();

    // 解析并存储分类配置
    toolboxConfig.contents?.forEach((category) => {
      if (category.kind === "category") {
        this.categories.set(category.name, category);
      }
    });

    // 更新工具箱
    this.updateToolbox();
  }

  /**
   * 添加新分类
   * @param name 分类名称
   * @param config 分类配置
   * @returns 创建的分类配置
   */
  public addCategory(
    name: string,
    config: Partial<CategoryConfig> = {},
  ): CategoryConfig {
    const category: CategoryConfig = {
      kind: "category",
      name: name,
      colour: config.colour || 160,
      contents: config.contents || [],
      ...config,
    };

    this.categories.set(name, category);
    this.updateToolbox();
    this.notifyListeners("categoryAdded", { name, category });

    return category;
  }

  /**
   * 移除分类
   * @param name 分类名称
   * @returns 是否成功移除
   */
  public removeCategory(name: string): boolean {
    const removed = this.categories.delete(name);
    if (removed) {
      this.updateToolbox();
      this.notifyListeners("categoryRemoved", { name });
    }
    return removed;
  }

  /**
   * 添加块到分类
   * @param categoryName 分类名称
   * @param blockConfig 块配置
   * @returns 是否成功添加
   */
  public addBlockToCategory(
    categoryName: string,
    blockConfig: string | BlockConfig,
  ): boolean {
    const category = this.categories.get(categoryName);
    if (!category) {
      console.error(`分类 "${categoryName}" 不存在`);
      return false;
    }

    if (!category.contents) {
      category.contents = [];
    }

    const block = this.createBlockConfig(blockConfig);
    category.contents.push(block);

    this.updateToolbox();
    this.notifyListeners("blockAdded", {
      categoryName,
      block: blockConfig,
    });

    return true;
  }

  /**
   * 批量添加块到分类
   * @param categoryName 分类名称
   * @param blocks 块配置数组
   * @returns 成功添加的数量
   */
  public addBlocksToCategory(
    categoryName: string,
    blocks: Array<string | BlockConfig>,
  ): number {
    const category = this.categories.get(categoryName);
    if (!category) {
      console.error(`分类 "${categoryName}" 不存在`);
      return 0;
    }

    if (!category.contents) {
      category.contents = [];
    }

    let addedCount = 0;
    blocks.forEach((blockConfig) => {
      const block = this.createBlockConfig(blockConfig);
      category.contents.push(block);
      addedCount++;
    });

    if (addedCount > 0) {
      this.updateToolbox();
      this.notifyListeners("blockAdded", {
        categoryName,
        block: blocks[0],
      });
    }

    return addedCount;
  }

  /**
   * 从分类中移除块
   * @param categoryName 分类名称
   * @param blockType 块类型
   * @returns 是否成功移除
   */
  public removeBlockFromCategory(
    categoryName: string,
    blockType: string,
  ): boolean {
    const category = this.categories.get(categoryName);
    if (!category?.contents) return false;

    const initialLength = category.contents.length;
    category.contents = category.contents.filter((item) => {
      if (item.kind === "block") {
        return (item as BlockConfig).type !== blockType;
      }
      return true;
    });

    if (initialLength !== category.contents.length) {
      this.updateToolbox();
      this.notifyListeners("blockRemoved", {
        categoryName,
        blockType,
      });
      return true;
    }

    return false;
  }

  /**
   * 创建块配置
   * @param config 块配置或块类型字符串
   * @returns 标准块配置
   */
  protected createBlockConfig(config: string | BlockConfig): BlockConfig {
    if (typeof config === "string") {
      return {
        kind: "block",
        type: config,
      };
    }

    return {
      ...config,
      kind: "block",
      type: config.type,
    };
  }

  /**
   * 更新分类顺序
   * @param categoryNames 分类名称数组（按新顺序）
   */
  public reorderCategories(categoryNames: string[]): void {
    const reorderedMap = new Map<string, CategoryConfig>();

    categoryNames.forEach((name) => {
      const category = this.categories.get(name);
      if (category) {
        reorderedMap.set(name, category);
      }
    });

    // 添加未包含在重排序列表中的分类
    this.categories.forEach((value, key) => {
      if (!reorderedMap.has(key)) {
        reorderedMap.set(key, value);
      }
    });

    this.categories = reorderedMap;
    this.updateToolbox();
    this.notifyListeners("categoriesReordered", { categoryNames });
  }

  /**
   * 更新分类样式
   * @param categoryName 分类名称
   * @param style 样式配置
   * @returns 是否成功更新
   */
  public updateCategoryStyle(
    categoryName: string,
    style: CategoryStyle,
  ): boolean {
    const category = this.categories.get(categoryName);
    if (!category) return false;

    if (style.colour !== undefined) {
      category.colour = style.colour;
    }
    if (style.cssConfig) {
      category.cssConfig = style.cssConfig;
    }
    if (style.categorystyle) {
      category.categorystyle = style.categorystyle;
    }

    this.updateToolbox();
    this.notifyListeners("categoryStyleUpdated", { categoryName, style });

    return true;
  }

  /**
   * 动态添加块到飞出菜单
   * @param blocks 块配置数组
   */
  public addFlyoutBlocks(blocks: Array<string | BlockConfig>): void {
    const flyoutBlocks = blocks.map((block) => this.createBlockConfig(block));

    // 获取当前工具箱配置
    const currentToolbox =
      this.workspace.options.languageTree || this.workspace.options.languageDef;

    // 创建新的工具箱配置
    const newToolbox: ToolboxConfig = {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "动态块",
          colour: 300,
          contents: flyoutBlocks,
        },
        ...(Array.isArray(currentToolbox?.contents)
          ? currentToolbox.contents
          : []),
      ],
    };

    this.workspace.updateToolbox(newToolbox);
  }

  /**
   * 获取分类
   * @param name 分类名称
   * @returns 分类配置或undefined
   */
  public getCategory(name: string): CategoryConfig | undefined {
    return this.categories.get(name);
  }

  /**
   * 获取所有分类
   * @returns 分类配置数组
   */
  public getAllCategories(): CategoryConfig[] {
    return Array.from(this.categories.values());
  }

  /**
   * 获取分类名称列表
   * @returns 分类名称数组
   */
  public getCategoryNames(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * 检查分类是否存在
   * @param name 分类名称
   * @returns 是否存在
   */
  public hasCategory(name: string): boolean {
    return this.categories.has(name);
  }

  /**
   * 获取分类数量
   * @returns 分类数量
   */
  public getCategoryCount(): number {
    return this.categories.size;
  }

  /**
   * 导出工具箱配置
   * @returns 工具箱配置对象
   */
  public exportToolbox(): ToolboxConfig {
    return {
      kind: "categoryToolbox",
      contents: this.getAllCategories(),
    };
  }

  /**
   * 导入工具箱配置
   * @param config 工具箱配置
   * @returns 是否成功导入
   */
  public importToolbox(config: ToolboxConfig): boolean {
    if (config.kind !== "categoryToolbox") {
      console.error("无效的工具箱配置");
      return false;
    }

    this.categories.clear();

    config.contents?.forEach((category) => {
      if (category.kind === "category") {
        this.categories.set(category.name, category);
      }
    });

    this.updateToolbox();
    this.notifyListeners("toolboxImported", { config });

    return true;
  }

  /**
   * 更新工具箱
   */
  protected updateToolbox(): void {
    console.log("toolboxmanager.updateToolbox categories:", this.categories);
    if (!this.workspace) return;

    const toolboxConfig = this.exportToolbox();
    console.log("toolboxmanager.updateToolbox toolboxConfig:", toolboxConfig);
    //this.workspace.updateToolbox(toolboxConfig);
    console.log("toolboxmanager.updateToolbox");
  }

  /**
   * 添加事件监听器
   * @param listener 监听器函数
   */
  public addListener(listener: ToolboxEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * 移除事件监听器
   * @param listener 监听器函数
   */
  public removeListener(listener: ToolboxEventListener): void {
    this.listeners.delete(listener);
  }

  /**
   * 清空所有监听器
   */
  public clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * 通知所有监听器
   * @param event 事件类型
   * @param data 事件数据
   */
  protected notifyListeners<T extends ToolboxEvent>(
    event: T,
    data: ToolboxEventData[T],
  ): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        console.error("监听器执行错误:", error);
      }
    });
  }

  /**
   * 清空工具箱
   */
  public clear(): void {
    this.categories.clear();
    this.updateToolbox();
    this.notifyListeners("toolboxCleared", {});
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    this.clearListeners();
    this.categories.clear();
    this.workspace = null as any;
    this.toolbox = null;
  }
}
