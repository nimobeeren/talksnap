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
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

const schema = z.object({
  key: z.string().min(1, {
    message: "API key is required",
  }),
});

export function ApiKeyDialog({
  defaultKey,
  onKeySubmit,
}: {
  defaultKey?: string;
  onKeySubmit: (key: string) => void;
}) {
  // LEFT HERE
  // TODO: pick a good time to open the dialog
  // TODO: store key in localStorage
  const [isOpen, setIsOpen] = useState(true);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { key: defaultKey ?? "" },
  });

  function onSubmit(values: z.infer<typeof schema>) {
    onKeySubmit(values.key);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              name="key"
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
