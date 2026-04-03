// searchable-toolbox-manager.ts
import * as Blockly from "blockly";
import { ToolboxManager } from "./toolbox-manager";
import { BlockConfig, BlockInfo } from "./toolbox-manager.types";

/**
 * 带搜索功能的工具箱管理器
 */
export class SearchableToolboxManager extends ToolboxManager {
  private searchInput: HTMLInputElement | null = null;
  private searchResultsDiv: HTMLDivElement | null = null;
  private blockIndex: Map<string, BlockInfo> = new Map();
  private isSearchEnabled: boolean = false;
  private searchDebounceTimer: number | null = null;

  /**
   * 构造函数
   * @param workspace Blockly工作区
   */
  constructor(workspace: Blockly.WorkspaceSvg) {
    super(workspace);
  }

  /**
   * 启用搜索功能
   * @param options 搜索选项
   */
  public enableSearch(options?: SearchOptions): void {
    if (this.isSearchEnabled) return;

    this.buildBlockIndex();
    this.createSearchUI(options);
    this.isSearchEnabled = true;
  }

  /**
   * 禁用搜索功能
   */
  public disableSearch(): void {
    if (!this.isSearchEnabled) return;

    this.removeSearchUI();
    this.isSearchEnabled = false;
  }

  /**
   * 重建块索引
   */
  public rebuildBlockIndex(): void {
    this.buildBlockIndex();
  }

  /**
   * 构建块索引
   */
  protected buildBlockIndex(): void {
    this.blockIndex.clear();

    this.categories.forEach((category, categoryName) => {
      const categoryColour = category.colour;

      category.contents?.forEach((item) => {
        if (item.kind === "block") {
          const blockConfig = item as BlockConfig;
          const blockInfo: BlockInfo = {
            type: blockConfig.type,
            category: categoryName,
            name: this.getBlockDisplayName(blockConfig.type),
            colour: categoryColour,
          };
          this.blockIndex.set(blockConfig.type, blockInfo);
        }
      });
    });
  }

  /**
   * 获取块显示名称
   * @param blockType 块类型
   * @returns 显示名称
   */
  protected getBlockDisplayName(blockType: string): string {
    try {
      // 尝试从Blockly定义中获取块名称
      const block = Blockly.Blocks[blockType];
      if (block && block.definition) {
        // 如果有定义，可以进一步处理
        return blockType.replace(/_/g, " ");
      }
    } catch (error) {
      console.warn(`无法获取块 "${blockType}" 的名称`, error);
    }

    // 默认返回格式化的类型名
    return blockType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * 创建搜索UI
   * @param options 搜索选项
   */
  protected createSearchUI(options?: SearchOptions): void {
    const toolbox = document.querySelector(".blocklyToolboxDiv");
    if (!toolbox) {
      console.warn("找不到工具箱元素");
      return;
    }

    // 创建搜索容器
    const searchContainer = document.createElement("div");
    searchContainer.className = "blockly-toolbox-search";
    searchContainer.style.cssText = `
      padding: 8px;
      margin-bottom: 8px;
      border-bottom: 1px solid #ddd;
    `;

    // 创建搜索输入框
    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.placeholder = options?.placeholder || "搜索块...";
    this.searchInput.style.cssText = `
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 12px;
      outline: none;
      box-sizing: border-box;
    `;

    // 创建搜索结果容器
    this.searchResultsDiv = document.createElement("div");
    this.searchResultsDiv.className = "blockly-search-results";
    this.searchResultsDiv.style.cssText = `
      display: none;
      max-height: 300px;
      overflow-y: auto;
      margin-top: 8px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
    `;

    // 组装UI
    searchContainer.appendChild(this.searchInput);
    searchContainer.appendChild(this.searchResultsDiv);
    toolbox.insertBefore(searchContainer, toolbox.firstChild);

    // 设置事件监听
    this.setupSearchListeners(options?.debounceDelay || 300);
  }

  /**
   * 设置搜索监听器
   * @param debounceDelay 防抖延迟（毫秒）
   */
  protected setupSearchListeners(debounceDelay: number): void {
    if (!this.searchInput) return;

    this.searchInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const query = target.value;

      // 防抖处理
      if (this.searchDebounceTimer) {
        window.clearTimeout(this.searchDebounceTimer);
      }

      this.searchDebounceTimer = window.setTimeout(() => {
        this.performSearch(query);
      }, debounceDelay);
    });

    this.searchInput.addEventListener("focus", () => {
      if (this.searchInput?.value) {
        this.performSearch(this.searchInput.value);
      }
    });

    // 点击外部关闭搜索结果
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (!searchContainer.contains(target)) {
        this.hideSearchResults();
      }
    });
  }

  /**
   * 执行搜索
   * @param query 搜索关键词
   */
  protected performSearch(query: string): void {
    const trimmedQuery = query.trim().toLowerCase();

    if (trimmedQuery.length < 2) {
      this.hideSearchResults();
      this.showOriginalToolbox();
      return;
    }

    const results: SearchResult[] = [];

    this.blockIndex.forEach((block) => {
      const nameMatch = block.name.toLowerCase().includes(trimmedQuery);
      const typeMatch = block.type.toLowerCase().includes(trimmedQuery);
      const categoryMatch = block.category.toLowerCase().includes(trimmedQuery);

      if (nameMatch || typeMatch || categoryMatch) {
        results.push({
          ...block,
          matchType: nameMatch ? "name" : typeMatch ? "type" : "category",
        });
      }
    });

    // 按匹配度排序
    results.sort((a, b) => {
      const order = { name: 0, type: 1, category: 2 };
      return order[a.matchType] - order[b.matchType];
    });

    this.displaySearchResults(results);
  }

  /**
   * 显示搜索结果
   * @param results 搜索结果
   */
  protected displaySearchResults(results: SearchResult[]): void {
    if (!this.searchResultsDiv) return;

    if (results.length === 0) {
      this.searchResultsDiv.innerHTML = `
        <div style="padding: 12px; text-align: center; color: #999;">
          未找到匹配的块
        </div>
      `;
    } else {
      this.searchResultsDiv.innerHTML = results
        .map(
          (result) => `
        <div class="search-result-item" 
             data-block-type="${result.type}"
             style="
               padding: 8px 12px;
               cursor: pointer;
               border-bottom: 1px solid #eee;
               transition: background 0.2s;
               ${result.colour ? `border-left: 3px solid hsl(${result.colour}, 50%, 50%);` : ""}
             "
             onmouseover="this.style.backgroundColor='#f5f5f5'"
             onmouseout="this.style.backgroundColor='transparent'">
          <div style="font-size: 11px; color: #666; margin-bottom: 2px;">
            ${result.category}
            <span style="float: right; font-size: 10px; color: #999;">
              ${
                result.matchType === "name"
                  ? "名称匹配"
                  : result.matchType === "type"
                    ? "类型匹配"
                    : "分类匹配"
              }
            </span>
          </div>
          <div style="font-weight: 500; color: #333;">
            ${this.highlightMatch(result.name, this.searchInput?.value || "")}
          </div>
          <div style="font-size: 10px; color: #999; margin-top: 2px;">
            ${result.type}
          </div>
        </div>
      `,
        )
        .join("");

      // 添加点击事件
      this.searchResultsDiv
        .querySelectorAll(".search-result-item")
        .forEach((item) => {
          item.addEventListener("click", () => {
            const blockType = item.getAttribute("data-block-type");
            if (blockType) {
              this.insertBlockToWorkspace(blockType);
              this.hideSearchResults();
            }
          });
        });
    }

    this.searchResultsDiv.style.display = "block";
    this.hideOriginalToolbox();
  }

  /**
   * 高亮匹配文本
   * @param text 原始文本
   * @param query 搜索词
   * @returns 带高亮的HTML
   */
  protected highlightMatch(text: string, query: string): string {
    if (!query) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text.replace(
      regex,
      '<span style="background: #ffeb3b; font-weight: bold;">$1</span>',
    );
  }

  /**
   * 插入块到工作区
   * @param blockType 块类型
   */
  protected insertBlockToWorkspace(blockType: string): void {
    try {
      const block = this.workspace.newBlock(blockType);
      block.initSvg();
      block.render();

      // 计算居中位置
      const metrics = this.workspace.getMetrics();
      if (metrics) {
        const x = metrics.viewLeft + metrics.viewWidth / 2 - 50;
        const y = metrics.viewTop + metrics.viewHeight / 2 - 50;
        block.moveBy(x, y);
      }
    } catch (error) {
      console.error(`无法创建块 "${blockType}":`, error);
    }
  }

  /**
   * 隐藏搜索结果
   */
  protected hideSearchResults(): void {
    if (this.searchResultsDiv) {
      this.searchResultsDiv.style.display = "none";
    }
    this.showOriginalToolbox();
  }

  /**
   * 显示原始工具箱
   */
  protected showOriginalToolbox(): void {
    const categories = document.querySelectorAll(".blocklyToolboxCategory");
    categories.forEach((cat) => ((cat as HTMLElement).style.display = "block"));
  }

  /**
   * 隐藏原始工具箱
   */
  protected hideOriginalToolbox(): void {
    const categories = document.querySelectorAll(".blocklyToolboxCategory");
    categories.forEach((cat) => ((cat as HTMLElement).style.display = "none"));
  }

  /**
   * 移除搜索UI
   */
  protected removeSearchUI(): void {
    const searchContainer = document.querySelector(".blockly-toolbox-search");
    if (searchContainer) {
      searchContainer.remove();
    }

    this.searchInput = null;
    this.searchResultsDiv = null;

    // 恢复原始工具箱显示
    this.showOriginalToolbox();
  }

  /**
   * 更新分类后重建索引
   */
  protected updateToolbox(): void {
    super.updateToolbox();
    if (this.isSearchEnabled) {
      this.buildBlockIndex();
    }
  }
}

/**
 * 搜索选项接口
 */
export interface SearchOptions {
  placeholder?: string;
  debounceDelay?: number;
  maxResults?: number;
}

/**
 * 搜索结果接口
 */
export interface SearchResult extends BlockInfo {
  matchType: "name" | "type" | "category";
}
