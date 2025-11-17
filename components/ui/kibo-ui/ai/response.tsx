"use client";

import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  type CodeBlockProps,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from "../code-block";
import type { HTMLAttributes } from "react";
import { memo, useMemo, useState } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon, SaveIcon } from "lucide-react";
import { useFetcher } from "react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import "katex/dist/katex.min.css";

export type AIResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options["children"];
  imageBasePath: string;
  lessonId?: string;
  hasExplainerOrProblem?: boolean;
};

const getComponents = (imageBasePath: string): Options["components"] => ({
  ol: ({ node, children, className, ...props }) => (
    <ol className={cn("ml-4 list-outside list-decimal", className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }) => (
    <li className={cn("py-1", className)} {...props}>
      {children}
    </li>
  ),
  ul: ({ node, children, className, ...props }) => (
    <ul className={cn("ml-4 list-outside list-decimal", className)} {...props}>
      {children}
    </ul>
  ),
  strong: ({ node, children, className, ...props }) => (
    <span className={cn("font-semibold", className)} {...props}>
      {children}
    </span>
  ),
  a: ({ node, children, className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline", className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ node, children, className, ...props }) => (
    <h1
      className={cn("mt-6 mb-2 font-semibold text-3xl", className)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h2
      className={cn("mt-6 mb-2 font-semibold text-2xl", className)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h3 className={cn("mt-6 mb-2 font-semibold text-xl", className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4 className={cn("mt-6 mb-2 font-semibold text-lg", className)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ node, children, className, ...props }) => (
    <h5
      className={cn("mt-6 mb-2 font-semibold text-base", className)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ node, children, className, ...props }) => (
    <h6 className={cn("mt-6 mb-2 font-semibold text-sm", className)} {...props}>
      {children}
    </h6>
  ),
  pre: ({ node, className, children }) => {
    let language = "javascript";

    if (typeof node?.properties?.className === "string") {
      language = node.properties.className.replace("language-", "");
    }

    const childrenIsCode =
      typeof children === "object" &&
      children !== null &&
      "type" in children &&
      children.type === "code";

    if (!childrenIsCode) {
      return <pre>{children}</pre>;
    }

    const data: CodeBlockProps["data"] = [
      {
        language,
        filename: "index.js",
        code: (children.props as { children: string }).children,
      },
    ];

    return (
      <CodeBlock
        className={cn("my-4 h-auto", className)}
        data={data}
        defaultValue={data[0]!.language}
      >
        <CodeBlockHeader>
          <CodeBlockFiles>
            {(item) => (
              <CodeBlockFilename key={item.language} value={item.language}>
                {item.filename}
              </CodeBlockFilename>
            )}
          </CodeBlockFiles>
          <CodeBlockSelect>
            <CodeBlockSelectTrigger>
              <CodeBlockSelectValue />
            </CodeBlockSelectTrigger>
            <CodeBlockSelectContent>
              {(item) => (
                <CodeBlockSelectItem key={item.language} value={item.language}>
                  {item.language}
                </CodeBlockSelectItem>
              )}
            </CodeBlockSelectContent>
          </CodeBlockSelect>
          <CodeBlockCopyButton
            onCopy={() => console.log("Copied code to clipboard")}
            onError={() => console.error("Failed to copy code to clipboard")}
          />
        </CodeBlockHeader>
        <CodeBlockBody>
          {(item) => (
            <CodeBlockItem key={item.language} value={item.language}>
              <CodeBlockContent language={item.language as BundledLanguage}>
                {item.code}
              </CodeBlockContent>
            </CodeBlockItem>
          )}
        </CodeBlockBody>
      </CodeBlock>
    );
  },
  img: ({ node, children, className, ...props }) => {
    const fullImagePath = `${imageBasePath}/${props.src}`;
    return (
      <img
        {...props}
        className={cn("max-w-full my-6", className)}
        src={`/view-image?imagePath=${fullImagePath}`}
      />
    );
  },
});

export const AIResponse = memo(
  ({ className, options, children, ...props }: AIResponseProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const writeToReadmeFetcher = useFetcher();

    const copyToClipboard = async () => {
      try {
        // Convert the markdown content to plain text for copying
        const textContent = typeof children === "string" ? children : "";
        await navigator.clipboard.writeText(textContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    };

    const writeToReadme = () => {
      const textContent = typeof children === "string" ? children : "";
      writeToReadmeFetcher.submit(
        { lessonId: props.lessonId!, content: textContent },
        {
          method: "POST",
          action: "/api/write-readme",
          encType: "application/json",
        }
      );
    };

    const components = useMemo(
      () => getComponents(props.imageBasePath),
      [props.imageBasePath]
    );

    const showWriteButton =
      props.lessonId && props.hasExplainerOrProblem !== undefined;
    const isWriting =
      writeToReadmeFetcher.state === "submitting" ||
      writeToReadmeFetcher.state === "loading";

    return (
      <div
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 relative group",
          className
        )}
        {...props}
      >
        <div className="absolute bottom-2 -right-24 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-24 text-left"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            {isCopied ? (
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                <span>Copied</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CopyIcon className="h-4 w-4" />
                <span>Copy</span>
              </div>
            )}
          </Button>
          {showWriteButton && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      className="w-24 text-left"
                      onClick={writeToReadme}
                      disabled={!props.hasExplainerOrProblem || isWriting}
                      title="Write to readme"
                    >
                      <div className="flex items-center gap-2">
                        <SaveIcon className="h-4 w-4" />
                        <span>{isWriting ? "Writing..." : "Write"}</span>
                      </div>
                    </Button>
                  </span>
                </TooltipTrigger>
                {!props.hasExplainerOrProblem && (
                  <TooltipContent>
                    <p>No explainer or problem folder</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <ReactMarkdown
          components={components}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkGfm, remarkMath]}
          {...options}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
