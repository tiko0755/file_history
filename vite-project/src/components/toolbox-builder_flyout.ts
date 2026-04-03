// toolbox-builder.ts
import {
  FlyoutToolboxConfig,
  BlockConfig,
  ButtonConfig,
  LabelConfig,
  SeparatorConfig,
} from "../utils/blocklyToolboxManager/toolbox-manager.types";

/**
 * 工具箱配置构建器
 * 提供流畅的API来构建工具箱配置
 */
export class FlyoutToolboxBuilder {
  private contents: Array<
    BlockConfig | SeparatorConfig | LabelConfig | ButtonConfig
  > = [];

  private seperator: number = 5;

  /**
   * 构造函数
   * @param initialConfig 初始配置
   */
  constructor() {
    this.contents = [];
  }

  public clear(): this {
    this.contents = [];
    return this;
  }

  public setSeperator(sep: number): this {
    this.seperator = sep;
    return this;
  }

  /**
   * 添加块到当前分类
   * @param blockType 块类型或块配置
   * @param options 块选项
   * @returns 构建器实例
   */
  public addBlock(
    blockType: string,
    options?: Partial<Omit<BlockConfig, "kind" | "type">>,
  ): this {
    this.contents.push({
      kind: "block",
      type: blockType,
      ...options,
    });
    this.contents.push({
      kind: "sep",
      gap: this.seperator,
    });
    return this;
  }

  /**
   * 批量添加块
   * @param blocks 块类型数组或块配置数组
   * @returns 构建器实例
   */
  public addBlocks(blocks: Array<string>): this {
    blocks.forEach((block) => {
      this.addBlock(block);
    });

    return this;
  }

  /**
   * 添加标签
   * @param text 标签文本
   * @param webClass CSS类名
   * @returns 构建器实例
   */
  public addLabel(text: string, webClass?: string): this {
    const label: LabelConfig = {
      kind: "label",
      text: text,
      ...(webClass ? { webClass } : {}),
    };

    this.contents.push(label);
    this.contents.push({
      kind: "sep",
      gap: this.seperator,
    });

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
    const button: ButtonConfig = {
      kind: "button",
      text: text,
      callbackKey: callbackKey,
      ...(webClass ? { webClass } : {}),
    };

    this.contents.push(button);
    this.contents.push({
      kind: "sep",
      gap: this.seperator,
    });

    return this;
  }

  /**
   * 构建工具箱配置
   * @returns 工具箱配置
   */
  public build(): FlyoutToolboxConfig {
    return {
      kind: "flyoutToolbox",
      contents: this.contents,
    };
  }
}
