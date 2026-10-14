import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useRoute } from "../../context/RouterContext";
import { useEnquiry, type EnquiryDraft } from "../../context/EnquiryContext";
import { useToast } from "../../context/ToastContext";
import { Icon } from "../common/Icon";

export function EnquiryForm() {
  const { t, lang } = useLanguage();
  const { q } = useRoute();
  const { draft, setDraft, bomFile, setBomFile, prepared, setPrepared } =
    useEnquiry();
  const toast = useToast();
  const [fileError, setFileError] = useState("");
  const preparedBody = useRef<HTMLTextAreaElement>(null);
  useEffect(() => setFileError(""), [lang]);
  const update = (field: keyof EnquiryDraft, value: string) =>
    setDraft((previous) => ({ ...previous, [field]: value }));
  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.setCustomValidity("");
    setFileError("");
    if (
      file &&
      (file.size > 10 * 1024 * 1024 ||
        !/\.(xlsx|xls|csv|pdf|txt)$/i.test(file.name))
    ) {
      setBomFile(null);
      input.value = "";
      setFileError(
        t(
          "请使用不超过 10 MB 的 XLSX、XLS、CSV、PDF 或 TXT 文件。",
          "Use an XLSX, XLS, CSV, PDF or TXT file up to 10 MB.",
        ),
      );
    } else setBomFile(file || null);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [
      `Contact: ${draft.name}`,
      `Company: ${draft.company || ""}`,
      `Email: ${draft.email}`,
      `Phone: ${draft.phone || ""}`,
      `\nRequirements:\n${draft.message}`,
      bomFile
        ? `\nBOM: ${bomFile.name} (${t("请手动添加附件", "Please attach this file manually")})`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    setPrepared({
      body,
      subject:
        "Taitien / Simacity " +
        (q.get("subject") === "BOM" ? "BOM " : "") +
        "Enquiry",
    });
  };
  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(prepared?.body || "");
      toast(t("询价内容已复制", "Enquiry copied"));
    } catch {
      preparedBody.current?.focus();
      preparedBody.current?.select();
      try {
        if (!document.execCommand("copy")) throw new Error("Copy unavailable");
        toast(t("询价内容已复制", "Enquiry copied"));
      } catch {
        toast(
          t(
            "内容已选中，请手动复制",
            "Text selected. Please copy it manually.",
          ),
        );
      }
    }
  };
  if (prepared) {
    const mail =
      "mailto:taitien@simacity.com.cn?subject=" +
      encodeURIComponent(prepared.subject) +
      "&body=" +
      encodeURIComponent(prepared.body);
    return (
      <div className="prepared" role="status">
        <Icon name="check" />
        <h3>{t("询价内容已整理", "Your enquiry is prepared")}</h3>
        <p>
          {t(
            "尚未发送。点击下方按钮打开邮件应用，确认后发送。",
            "Not sent yet. Open your email application below, review and send.",
          )}
        </p>
        {bomFile ? (
          <div className="notice">
            {t(
              "请在邮件中手动添加附件：",
              "Please attach this file manually in your email: ",
            ) + bomFile.name}
          </div>
        ) : null}
        <textarea
          ref={preparedBody}
          id="prepared-body"
          readOnly
          aria-label={t("询价邮件内容", "Enquiry email content")}
          value={prepared.body}
        />
        <div className="action-row">
          <a className="button primary" href={mail}>
            <Icon name="mail" />
            {t("打开邮件应用", "Open email app")}
          </a>
          <button
            className="button secondary"
            data-action="copy"
            onClick={copy}
          >
            {t("复制内容", "Copy content")}
          </button>
        </div>
        <button
          className="text-link"
          data-action="edit-enquiry"
          onClick={() => setPrepared(null)}
        >
          {t("修改需求", "Edit enquiry")}
        </button>
      </div>
    );
  }
  const field = (
    name: keyof EnquiryDraft,
    zh: string,
    en: string,
    type = "text",
    required = false,
    auto = "off",
  ) => (
    <label>
      {t(zh, en) + (required ? " *" : "")}
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={auto}
        maxLength={120}
        value={draft[name]}
        onChange={(event) => update(name, event.target.value)}
      />
    </label>
  );
  return (
    <form className="enquiry-form" data-form="enquiry" onSubmit={submit}>
      <div className="form-grid">
        {field("name", "您的姓名", "Your name", "text", true, "name")}
        {field("company", "公司名称", "Company", "text", false, "organization")}
        {field("email", "联系邮箱", "Email", "email", true, "email")}
        {field("phone", "联系电话", "Phone", "tel", false, "tel")}
      </div>
      <label>
        {t("型号与需求说明", "Part numbers & requirements") + " *"}
        <textarea
          name="message"
          required
          rows={5}
          maxLength={1800}
          placeholder={t(
            "请填写型号、数量、目标交期，或频率、封装等选型条件。",
            "Include part numbers, quantities and delivery date, or frequency and package requirements.",
          )}
          value={draft.message}
          onChange={(event) => update("message", event.target.value)}
        />
      </label>
      <label className="file-upload">
        <Icon name="upload" />
        <span>
          <span id="file-name">
            {bomFile?.name ||
              t(
                "选择 BOM 文件（邮件中需手动附上）",
                "Choose a BOM file (attach manually in email)",
              )}
          </span>
          <small>
            {"XLSX / XLS / CSV / PDF / TXT · " + t("最大 10 MB", "Up to 10 MB")}
          </small>
        </span>
        <input
          type="file"
          name="bom"
          accept=".xlsx,.xls,.csv,.pdf,.txt"
          aria-label="BOM file"
          onChange={chooseFile}
        />
      </label>
      <p className="form-note">
        {t(
          "此表单不上传或保存文件；BOM 需在邮件应用中手动添加。",
          "This form does not upload or store files. Attach your BOM in your email application.",
        )}
      </p>
      <p
        id="file-error"
        className="form-error"
        role="alert"
        hidden={!fileError}
      >
        {fileError}
      </p>
      <button className="button primary" type="submit">
        {t("生成询价邮件", "Prepare enquiry email")}
        <Icon name="arrow" />
      </button>
    </form>
  );
}
