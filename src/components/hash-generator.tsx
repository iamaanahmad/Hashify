"use client";

import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Shield, ShieldHalf, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { md5 } from "@/lib/md5";

const algorithms = [
  {
    id: "md5",
    label: "MD5",
    icon: <Shield size={20} className="text-accent" />,
  },
  {
    id: "sha256",
    label: "SHA-256",
    icon: <ShieldHalf size={20} className="text-accent" />,
  },
  {
    id: "sha512",
    label: "SHA-512",
    icon: <ShieldCheck size={20} className="text-accent" />,
  },
];

export function HashGenerator() {
  const [inputText, setInputText] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("sha256");
  const [hashedOutput, setHashedOutput] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const generateHash = async () => {
      if (inputText === "") {
        setHashedOutput("");
        return;
      }

      let hash = "";
      try {
        if (selectedAlgorithm === "md5") {
          hash = md5(inputText);
        } else {
          const algoName = selectedAlgorithm.toUpperCase().replace("SHA", "SHA-");
          if (typeof crypto === 'undefined' || !crypto.subtle) {
            throw new Error('Crypto API not available');
          }
          const msgUint8 = new TextEncoder().encode(inputText);
          const hashBuffer = await crypto.subtle.digest(algoName, msgUint8);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        }
        setHashedOutput(hash);
      } catch (error) {
        console.error("Hashing failed:", error);
        let description = "Could not generate hash. Please try again.";
        if (error instanceof Error && error.message.includes('Crypto')) {
          description = "Secure context required. This feature works best on localhost or HTTPS.";
        }
        
        setHashedOutput("Error generating hash.");
        toast({
          title: "Hashing Error",
          description: description,
          variant: "destructive",
        });
      }
    };

    startTransition(() => {
      generateHash();
    });
  }, [inputText, selectedAlgorithm, toast]);

  const handleCopy = async () => {
    if (!hashedOutput || isPending || hashedOutput.startsWith("Error")) return;
    try {
      await navigator.clipboard.writeText(hashedOutput);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy hash to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-2xl bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline tracking-tight">
          Hashify
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Generate cryptographic hashes for your text instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="text-input" className="font-medium">Input Text</Label>
          <Textarea
            id="text-input"
            placeholder="Type or paste your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[150px] text-base focus:ring-accent"
            aria-label="Text to hash"
          />
        </div>
        <div className="space-y-3">
          <Label className="font-medium">Algorithm</Label>
          <RadioGroup
            value={selectedAlgorithm}
            onValueChange={setSelectedAlgorithm}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {algorithms.map((algo) => (
              <Label
                key={algo.id}
                htmlFor={algo.id}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-md border-2 border-transparent bg-secondary cursor-pointer hover:border-primary/50 transition-all",
                  selectedAlgorithm === algo.id &&
                    "border-primary ring-2 ring-primary/50"
                )}
              >
                <RadioGroupItem value={algo.id} id={algo.id} className="border-muted-foreground" />
                {algo.icon}
                <span className="font-semibold text-foreground">{algo.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full space-y-2">
          <Label htmlFor="hash-output" className="font-medium">Generated Hash</Label>
          <div className="relative">
            <Input
              id="hash-output"
              readOnly
              value={isPending ? "Generating..." : hashedOutput}
              placeholder="Your hash will appear here"
              className="pr-12 h-12 text-base font-code bg-input/80 text-foreground truncate"
              aria-label="Generated hash"
              aria-live="polite"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={!hashedOutput || isPending || hashedOutput.startsWith("Error")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-accent hover:text-accent-foreground"
              aria-label="Copy hash"
            >
              <Copy
                className={cn(
                  "transition-transform duration-300",
                  isCopied && "scale-125 rotate-12 text-primary"
                )}
              />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
