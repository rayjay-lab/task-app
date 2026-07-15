"use client";

import { useActionState } from "react";
import { motion } from "motion/react";
import { createOrganization, joinOrganization } from "@/app/actions/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OnboardingForms() {
  const [createState, createAction, createPending] = useActionState(
    createOrganization,
    undefined,
  );
  const [joinState, joinAction, joinPending] = useActionState(joinOrganization, undefined);

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Get started</CardTitle>
            <CardDescription>
              Create a new organization, or join one with an invite code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create">
              <TabsList className="w-full">
                <TabsTrigger value="create" className="flex-1">
                  Create
                </TabsTrigger>
                <TabsTrigger value="join" className="flex-1">
                  Join
                </TabsTrigger>
              </TabsList>
              <TabsContent value="create" className="mt-4">
                <form action={createAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Organization name</Label>
                    <Input id="name" name="name" required placeholder="Acme Inc." />
                  </div>
                  {createState?.error && (
                    <p className="text-sm text-destructive">{createState.error}</p>
                  )}
                  <Button type="submit" disabled={createPending} className="w-full">
                    {createPending ? "Creating..." : "Create organization"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="join" className="mt-4">
                <form action={joinAction} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="code">Invite code</Label>
                    <Input
                      id="code"
                      name="code"
                      required
                      placeholder="A1B2C3D4"
                      className="uppercase"
                    />
                  </div>
                  {joinState?.error && (
                    <p className="text-sm text-destructive">{joinState.error}</p>
                  )}
                  <Button type="submit" disabled={joinPending} className="w-full">
                    {joinPending ? "Joining..." : "Join organization"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
