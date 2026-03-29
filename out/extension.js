"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
async function activate(context) {
    // Đăng ký lệnh quét function
    let disposable = vscode.commands.registerCommand('pos-research.listFunctions', async () => {
        // 1. Kiểm tra xem có đang mở file nào không
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Bạn cần mở một file code trước!');
            return;
        }
        // 2. Lấy danh sách Symbols (Ký hiệu) từ file hiện tại
        // Thêm một chút thời gian chờ để Language Server kịp phản hồi
        const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', editor.document.uri);
        if (!symbols || symbols.length === 0) {
            vscode.window.showWarningMessage('Không tìm thấy cấu trúc hàm. Hãy thử lưu file hoặc kiểm tra mục Outline.');
            return;
        }
        // 3. Tạo danh sách các vật phẩm để hiển thị lên Menu (QuickPick)
        const items = [];
        const extractFunctions = (syms) => {
            for (const sym of syms) {
                // Mở rộng bộ lọc: Lấy Function, Method, Constructor và cả Class (nếu bạn muốn)
                const isFunction = sym.kind === vscode.SymbolKind.Function ||
                    sym.kind === vscode.SymbolKind.Method ||
                    sym.kind === vscode.SymbolKind.Constructor;
                if (isFunction) {
                    items.push({
                        label: `$(symbol-method) ${sym.name}`, // Hiện icon và tên hàm
                        description: `Dòng ${sym.range.start.line + 1}`,
                        range: sym.range // Lưu vị trí để tí nữa nhảy tới
                    });
                }
                // Nếu có hàm lồng trong Class, tiếp tục quét con
                if (sym.children && sym.children.length > 0) {
                    extractFunctions(sym.children);
                }
            }
        };
        extractFunctions(symbols);
        // 4. Hiển thị Menu lên màn hình
        if (items.length > 0) {
            const selection = await vscode.window.showQuickPick(items, {
                placeHolder: `Tìm thấy ${items.length} functions. Chọn để di chuyển tới:`,
                matchOnDescription: true
            });
            // 5. Nếu người dùng chọn một hàm, di chuyển con trỏ tới đó
            if (selection) {
                editor.selection = new vscode.Selection(selection.range.start, selection.range.start);
                editor.revealRange(selection.range, vscode.TextEditorRevealType.InCenter);
            }
        }
        else {
            vscode.window.showInformationMessage('Không tìm thấy function nào trong file này.');
        }
    });
    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map