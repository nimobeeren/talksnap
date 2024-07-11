import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

const schema = z.object({
  apiKey: z.string(),
});

export function ApiKeyDialog({
  apiKey,
  onApiKeySubmit,
}: {
  apiKey?: string;
  onApiKeySubmit: (key: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(!apiKey);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { apiKey: apiKey ?? "" },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    onApiKeySubmit(values.apiKey);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* Need to set `font-emoji` to ensure symbols render as emoji instead of plain unicode glyph */}
        <Button variant="outline" className="font-emoji space-x-1 px-2">
          <span aria-label="key">🔑</span>
          {apiKey ? (
            <span aria-label="checkmark">✅</span>
          ) : (
            <span aria-label="warning">⚠️</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key</DialogTitle>
          <DialogDescription>
            To make snaps, you need to enter an{" "}
            <a
              href="https://platform.openai.com/account/api-keys"
              className="underline"
            >
              OpenAI API key
            </a>{" "}
            (risky but cool).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormControl>
                    <Input placeholder="sk..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
