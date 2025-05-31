import React, { useState, useRef, useEffect } from "react";
import "./ChatPage.css";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MathJax, MathJaxContext } from "better-react-mathjax";




const CodeBlockWithCopy = ({ code, language = "text" }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return (
    <div className="code-block-container" style={{ position: "relative", margin: "16px 0" }}>
      <div
        className="code-block-header"
        style={{
          backgroundColor: "#282c34",
          color: "#61dafb",
          padding: "4px 12px",
          fontSize: "12px",
          fontWeight: "600",
          fontFamily: "monospace",
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
          userSelect: "none",
        }}
      >
        {language.toUpperCase()}
      </div>

      <CopyToClipboard text={code.trim()} onCopy={() => setCopied(true)}>
        <button
          className="copy-button"
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            fontSize: "12px",
            padding: "4px 6px",
            backgroundColor: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            zIndex: 1,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </CopyToClipboard>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderBottomLeftRadius: "6px",
          borderBottomRightRadius: "6px",
          paddingTop: "12px",
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
};


const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newChatStarted, setNewChatStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [histories, setHistories] = useState([]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode", !darkMode);
  };

  const toggleSettingsPopup = () => {
    setShowSettingsPopup(!showSettingsPopup);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("username");
    if (!token) {
      navigate("/login");
    } else {
      setUsername(name || "User");
      fetchHistories(token);
    }
  }, [navigate]);

  const fetchHistories = async (token) => {
    try {
      const res = await fetch("/api/chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const startNewChat = () => {
    setMessages([]);
    setSelectedFile(null);
    setInput("");
    setNewChatStarted(true);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage && !selectedFile) return;

    const newMessages = [...messages];
    let userContent = userMessage;
    if (selectedFile) {
      userContent += `\n[File: ${selectedFile.name}]`;
    }

    newMessages.push({
      role: "user",
      content: userContent,
      file: selectedFile ? URL.createObjectURL(selectedFile) : null,
    });

    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setNewChatStarted(false);

    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("message", userMessage || "");
        response = await fetch("/api/chat/upload", {
          method: "POST",
          body: formData,
        });
        setSelectedFile(null);
      } else {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Tidak ada jawaban dari AI." },
      ]);
      setLoading(false);

      // Save history chat
      await saveHistoryChat(
        "New Chat - " + new Date().toLocaleString(),
        [...newMessages, { role: "assistant", content: data.reply }]
      );

      // Reload sidebar histories
      fetchHistories(localStorage.getItem("token"));
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Gagal memproses permintaan." },
      ]);
      setLoading(false);
    }
  };

  const saveHistoryChat = async (title, messages) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/chat/history", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, messages }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistoryChat = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/chat/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages);
      setSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const FileInfo = ({ file }) => {
    if (!file) return null;
    const isImage = file.type.startsWith("image/");
    const previewSrc = isImage ? URL.createObjectURL(file) : "/icons/file-icon.png";
    return (
      <div className="file-info">
        <img src={previewSrc} alt="file preview" className="file-preview" />
        <span className="file-name">{file.name}</span>
        <button
          className="remove-file-btn"
          onClick={() => setSelectedFile(null)}
          title="Hapus file"
        >
          ✕
        </button>
      </div>
    );
  };
  const renderMessageContent = (content) => {
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    const mathBlockRegex = /\\\[(.*?)\\\]/gs;

    const combinedRegex = new RegExp(
      `(${codeBlockRegex.source})|(${mathBlockRegex.source})`,
      "gs"
    );

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      if (match[1]) {
        const lang = match[2] || "text";
        const code = match[3];
        parts.push({
          type: "code",
          language: lang,
          content: code,
        });
      } else if (match[4]) {
        parts.push({
          type: "math-block",
          content: match[4].trim(),
        });
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return (
      <MathJaxContext>
        {parts.map((part, index) => {
          if (part.type === "code") {
            return (
              <CodeBlockWithCopy
                key={index}
                code={part.content}
                language={part.language}
              />
            );
          }

          if (part.type === "math-block") {
            return (
              <MathJax key={index} inline={false}>{part.content}</MathJax>
            );
          }

          // Inline math ($...$)
          const inlineRegex = /\$(.+?)\$/g;
          const inlineParts = [];
          let lastIdx = 0;
          let inlineMatch;
          let segKey = 0;
          while ((inlineMatch = inlineRegex.exec(part.content)) !== null) {
            if (inlineMatch.index > lastIdx) {
              inlineParts.push(
                part.content.substring(lastIdx, inlineMatch.index)
              );
            }
            inlineParts.push(
              <MathJax key={segKey++} inline>{inlineMatch[1]}</MathJax>
            );
            lastIdx = inlineMatch.index + inlineMatch[0].length;
          }
          if (lastIdx < part.content.length) {
            inlineParts.push(part.content.substring(lastIdx));
          }

          // Final render (heading, bold, line-break)
          return (
            <span key={index}>
              {inlineParts.map((line, i) => {
                if (typeof line !== "string") {
                  return <React.Fragment key={i}>{line}</React.Fragment>;
                }

                return line.split("\n").map((subline, j) => {
                  if (subline.startsWith("### ")) {
                    return (
                      <h3 key={j} style={{ margin: "8px 0" }}>
                        {subline.slice(4)}
                      </h3>
                    );
                  }

                  // Bold parsing **text**
                  const boldRegex = /\*\*(.+?)\*\*/g;
                  const segments = [];
                  let lastBoldIdx = 0;
                  let matchBold;
                  let segKey2 = 0;
                  while ((matchBold = boldRegex.exec(subline)) !== null) {
                    if (matchBold.index > lastBoldIdx) {
                      segments.push(
                        <React.Fragment key={segKey2++}>
                          {subline.substring(lastBoldIdx, matchBold.index)}
                        </React.Fragment>
                      );
                    }
                    segments.push(
                      <strong key={segKey2++}>{matchBold[1]}</strong>
                    );
                    lastBoldIdx = matchBold.index + matchBold[0].length;
                  }
                  if (lastBoldIdx < subline.length) {
                    segments.push(
                      <React.Fragment key={segKey2++}>
                        {subline.substring(lastBoldIdx)}
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={j}>
                      {segments}
                      <br />
                    </React.Fragment>
                  );
                });
              })}
            </span>
          );
        })}
      </MathJaxContext>
    );
  };



  return (
    <div className={`chat-wrapper ${darkMode ? "dark-mode" : ""}`}>
      {sidebarOpen && (
        <div className="sidebar-backdrop show" onClick={() => setSidebarOpen(false)}></div>
      )}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">CDT.AI</span>
          </div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="sidebar-content">
          <button className="new-chat-btn" onClick={startNewChat}>+ New Chat</button>
          <div className="sidebar-menu">
            <button className="sidebar-btn">
              <img src="/icons/explore.png" alt="Explore" className="icon-img" />
              Explore
            </button>
            <button className="sidebar-btn">
              <img src="/icons/history.png" alt="history" className="icon-img" />
              History
            </button>
          </div>

          <div className="recent-chats">
            {histories.map((h) => (
              <div
                key={h.id}
                className="recent-item"
                onClick={() => loadHistoryChat(h.id)}
                style={{ cursor: "pointer" }}
              >
                <img src="/icons/schedule.png" alt="chat icon" className="icon-img" />
                {h.title}
              </div>
            ))}
          </div>


        </div>
        <div className="sidebar-settings" onClick={toggleSettingsPopup} style={{ cursor: "pointer" }}>
          <img src="/icons/setting.png" alt="Settings" className="icon-img" />
          <span>Settings</span>
        </div>


        <div className="sidebar-user">
          <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, }}>
            <img
              src="/icons/profile.png"
              alt="User Avatar"
              className="sidebar-avatar"
              style={{ marginRight: '12px' }}
            />
            <div className="sidebar-username">{username}</div>
          </div>
          <button
            className="logout-inline-btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            aria-label="Logout"
          >
            <img
              src="/icons/exit.png"
              alt="Logout Icon"
              className="logout-icon"
              style={{ width: '10px', height: '10px' }}
            />
          </button>
        </div>

      </div>


      <div
        className="chat-main"
        style={{
          marginLeft: sidebarOpen ? "240px" : "0",
        }}
      >
        <div
          className="topbar-modern"
          style={{
            left: sidebarOpen ? "240px" : "0",
          }}
        >
          <div className="topbar-left">
            {!sidebarOpen && (
              <button
                className="open-sidebar-btn"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
            )}
            <span className="topbar-title">Cemerlang AI 1.0</span>
          </div>

          <div className="topbar-right">
            <div className="topbar-card">
              <button className="topbar-button">
                <img src="/icons/link.png" alt="Link" />
              </button>
            </div>
            <div className="topbar-card">
              <button className="topbar-button">
                <img src="/icons/share.png" alt="Share" />
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="chat-box-center">
          <div className="chat-box">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>

                <div className="msg-content">
                  <div className="msg-author">
                    {msg.role === "user" ? (
                      <>
                        <img src="/icons/profile.png" alt="User Icon" className="inline-icon" />
                        {username}
                      </>
                    ) : (
                      <>
                        <img src="/icons/bot.png" alt="Assistant Icon" className="inline-icon" />
                        Cemerlang AI
                      </>
                    )}
                  </div>
                  {renderMessageContent(msg.content)}
                  {msg.file && msg.file.startsWith("blob:") && (
                    <div className="chat-image-preview">
                      <img src={msg.file} alt="Uploaded preview" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg assistant">
                <div className="msg-content">Mengetik...</div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>
        </div>

        <div className="chat-input-wrapper" style={{
          margin: "0 auto 20px auto",
          height: newChatStarted ? "calc(100vh - 150px)" : "60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: newChatStarted ? "center" : "flex-end",
        }}>
          {/* Header */}
          <div className={`chat-input-header ${newChatStarted ? "visible" : "hidden"}`}>
            What can I help you with today?
          </div>
          {/* File Info di atas input box */}
          {selectedFile && (
            <FileInfo file={selectedFile} onRemove={() => setSelectedFile(null)} />
          )}
          {/* Input box dan tombol */}
          <div
            className="chat-input-box"
            style={{
              marginTop: "0",
              transition: "margin-top 0.3s ease",
            }}
          >


            <label htmlFor="fileInput" className="file-input-label">
              <img src="/icons/folder.png" alt="upload icon" className="icon-img" />
              <input
                type="file"
                id="fileInput"
                accept="image/*,.pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
            <textarea
              className="chat-input"
              rows="1"
              value={input}
              placeholder="Message Cemerlang"
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage} disabled={loading}>
              Kirim
            </button>
          </div>

          <div className="chat-footer-note">
            CDT.AI bisa saja salah. Harap verifikasi informasi penting.{" "}
            <a
              href="https://cemerlangaircond.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Lihat Kebijakan Cookie
            </a>
          </div>
        </div>

      </div>
      {showSettingsPopup && (
        <div className="popup-overlay" onClick={toggleSettingsPopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Settings</h3>
            <div className="setting-item">
              <label htmlFor="darkModeToggle">Dark Mode</label>
              <input
                type="checkbox"
                id="darkModeToggle"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
            </div>
            <button className="close-popup" onClick={toggleSettingsPopup}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatPage;
