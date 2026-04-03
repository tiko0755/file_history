// toolbox-builder.ts
import {
  CategoryConfig,
  ToolboxConfig,
  BlockConfig,
  ButtonConfig,
  LabelConfig,
  SeparatorConfig,
} from "./toolbox-manager.types";

/**
 * 工具箱配置构建器
 * 提供流畅的API来构建工具箱配置
 */
export class ToolboxBuilder {
  private categories: CategoryConfig[] = [];
  private flyoutContents: Array<
    BlockConfig | SeparatorConfig | LabelConfig | ButtonConfig
  > = [];
  private currentCategoryIndex: number = -1;

  /**
   * 构造函数
   * @param initialConfig 初始配置
   */
  constructor(initialConfig?: ToolboxConfig) {
    if (initialConfig?.contents) {
      this.categories = [...initialConfig.contents];
      if (this.categories.length > 0) {
        this.currentCategoryIndex = 0;
      }
    }
  }

  /**
   * 添加分类
   * @param name 分类名称
   * @param colour 分类颜色
   * @param options 其他选项
   * @returns 构建器实例
   */
  public addCategory(
    name: string,
    colour: string | number = 160,
    options: Partial<
      Omit<CategoryConfig, "kind" | "name" | "colour" | "contents">
    > = {},
  ): this {
    const category: CategoryConfig = {
      kind: "category",
      name: name,
      colour: colour,
      contents: [],
      ...options,
    };

    this.categories.push(category);
    this.currentCategoryIndex = this.categories.length - 1;

    return this;
  }

  /**
   * 添加分类
   * @param name 分类名称
   * @param colour 分类颜色
   * @param options 其他选项
   * @returns 构建器实例
   */
  public newFlyout(): this {
    this.flyoutContents = [];
    return this;
  }

  /**
   * 添加块到当前分类
   * @param blockType 块类型或块配置
   * @param options 块选项
   * @returns 构建器实例
   */
  public flyoutAppendBlock(
    blockType: string | BlockConfig,
    options?: Partial<Omit<BlockConfig, "kind" | "type">>,
  ): this {
    const block: BlockConfig =
      typeof blockType === "string"
        ? {
            kind: "block",
            type: blockType,
            ...options,
          }
        : blockType;
    this.flyoutContents.push(block);
    return this;
  }

  /**
   * 添加块到当前分类
   * @param blockType 块类型或块配置
   * @param options 块选项
   * @returns 构建器实例
   */
  public addBlock(
    blockType: string | BlockConfig,
    options?: Partial<Omit<BlockConfig, "kind" | "type">>,
  ): this {
    this.ensureCurrentCategory();

    const block: BlockConfig =
      typeof blockType === "string"
        ? {
            kind: "block",
            type: blockType,
            ...options,
          }
        : blockType;

    this.getCurrentCategory().contents.push(block);

    return this;
  }

  /**
   * 批量添加块
   * @param blocks 块类型数组或块配置数组
   * @returns 构建器实例
   */
  public addBlocks(blocks: Array<string | BlockConfig>): this {
    this.ensureCurrentCategory();

    blocks.forEach((block) => {
      if (typeof block === "string") {
        this.addBlock(block);
      } else {
        this.addBlock(block);
      }
    });

    return this;
  }

  /**
   * 添加分隔符
   * @param gap 间距
   * @returns 构建器实例
   */
  public addSeparator(gap?: number): this {
    this.ensureCurrentCategory();

    const separator: SeparatorConfig = {
      kind: "sep",
      ...(gap !== undefined ? { gap } : {}),
    };

    this.getCurrentCategory().contents.push(separator);

    return this;
  }

  /**
   * 添加标签
   * @param text 标签文本
   * @param webClass CSS类名
   * @returns 构建器实例
   */
  public addLabel(text: string, webClass?: string): this {
    this.ensureCurrentCategory();

    const label: LabelConfig = {
      kind: "label",
      text: text,
      ...(webClass ? { webClass } : {}),
    };

    this.getCurrentCategory().contents.push(label);

    return this;
  }

  /**
   * 添加按钮
   * @param text 按钮文本
   * @param callbackKey 回调键
   * @param webClass CSS类名
   * @returns 构建器实例
   */
  public addButton(text: string, callbackKey: string, webClass?: string): this {
    this.ensureCurrentCategory();

    const button: ButtonConfig = {
      kind: "button",
      text: text,
      callbackKey: callbackKey,
      ...(webClass ? { webClass } : {}),
    };

    this.getCurrentCategory().contents.push(button);

    return this;
  }

  /**
   * 切换到指定分类
   * @param categoryName 分类名称
   * @returns 构建器实例
   */
  public switchToCategory(categoryName: string): this {
    const index = this.categories.findIndex((c) => c.name === categoryName);
    if (index >= 0) {
      this.currentCategoryIndex = index;
    } else {
      console.warn(`分类 "${categoryName}" 不存在，将创建新分类`);
      this.addCategory(categoryName);
    }

    return this;
  }

  /**
   * 更新当前分类属性
   * @param updates 要更新的属性
   * @returns 构建器实例
   */
  public updateCurrentCategory(
    updates: Partial<Omit<CategoryConfig, "kind" | "contents">>,
  ): this {
    this.ensureCurrentCategory();

    const currentCategory = this.getCurrentCategory();
    Object.assign(currentCategory, updates);

    return this;
  }

  /**
   * 移除当前分类的最后一项
   * @returns 构建器实例
   */
  public removeLastItem(): this {
    this.ensureCurrentCategory();

    const currentCategory = this.getCurrentCategory();
    currentCategory.contents.pop();

    return this;
  }

  /**
   * 清空当前分类
   * @returns 构建器实例
   */
  public clearCurrentCategory(): this {
    this.ensureCurrentCategory();

    this.getCurrentCategory().contents = [];

    return this;
  }

  /**
   * 移除指定分类
   * @param categoryName 分类名称
   * @returns 构建器实例
   */
  public removeCategory(categoryName: string): this {
    const index = this.categories.findIndex((c) => c.name === categoryName);
    if (index >= 0) {
      this.categories.splice(index, 1);

      if (this.currentCategoryIndex >= this.categories.length) {
        this.currentCategoryIndex = this.categories.length - 1;
      }
    }

    return this;
  }

  /**
   * 构建工具箱配置
   * @returns 工具箱配置
   */
  public build(): ToolboxConfig {
    return {
      kind: "categoryToolbox",
      contents: this.categories,
    };
  }

  /**
   * 克隆构建器
   * @returns 新的构建器实例
   */
  public clone(): ToolboxBuilder {
    const builder = new ToolboxBuilder();
    builder.categories = JSON.parse(JSON.stringify(this.categories));
    builder.currentCategoryIndex = this.currentCategoryIndex;
    return builder;
  }

  /**
   * 确保存在当前分类
   */
  private ensureCurrentCategory(): void {
    if (this.currentCategoryIndex === -1) {
      this.addCategory("默认分类");
    }
  }

  /**
   * 获取当前分类
   * @returns 当前分类配置
   */
  private getCurrentCategory(): CategoryConfig {
    return this.categories[this.currentCategoryIndex];
  }

  /**
   * 获取所有分类
   * @returns 分类数组
   */
  public getCategories(): CategoryConfig[] {
    return [...this.categories];
  }

  /**
   * 获取分类数量
   * @returns 分类数量
   */
  public getCategoryCount(): number {
    return this.categories.length;
  }

  /**
   * 获取当前分类名称
   * @returns 当前分类名称
   */
  public getCurrentCategoryName(): string | null {
    if (this.currentCategoryIndex === -1) return null;
    return this.categories[this.currentCategoryIndex].name;
  }

  /**
   * 检查分类是否存在
   * @param categoryName 分类名称
   * @returns 是否存在
   */
  public hasCategory(categoryName: string): boolean {
    return this.categories.some((c) => c.name === categoryName);
  }

  /**
   * 重置构建器
   * @returns 构建器实例
   */
  public reset(): this {
    this.categories = [];
    this.currentCategoryIndex = -1;
    return this;
  }
}
